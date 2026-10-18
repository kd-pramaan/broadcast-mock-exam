import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "../../../../lib/db.js";
import { getCurrentUser } from "../../../../lib/auth.js";
import { summarizePapers } from "../../../../lib/exams.js";

function normalizeQuestions(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value.questions)) return value.questions;
  return null;
}

function normalizePapers(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value.papers)) return value.papers;
  return null;
}

function validateQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return "The JSON file must contain a non-empty array of questions.";
  }
  const seenIds = new Set();
  for (const [i, q] of questions.entries()) {
    const where = `Question ${i + 1}`;
    if (!q || typeof q !== "object") return `${where}: must be an object.`;
    if (!q.id || typeof q.id !== "string") return `${where}: missing string "id".`;
    if (seenIds.has(q.id)) return `${where}: duplicate id "${q.id}".`;
    seenIds.add(q.id);
    if (!q.text || typeof q.text !== "string") return `${where}: missing string "text".`;
    if (!Array.isArray(q.options) || q.options.length < 2) return `${where}: "options" must be an array of at least 2 choices.`;
    if (!q.options.every((o) => typeof o === "string" && o)) return `${where}: every option must be a non-empty string.`;
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      return `${where}: "correctIndex" must point at one of the options.`;
    }
    if (typeof q.marks !== "number" || q.marks <= 0) return `${where}: "marks" must be a positive number.`;
  }
  return null;
}

function validatePapers(papers) {
  if (!Array.isArray(papers) || papers.length === 0) {
    return "A full exam's JSON must contain a non-empty array of papers.";
  }
  const seenKeys = new Set();
  const allIds = new Set();
  for (const [i, paper] of papers.entries()) {
    const where = `Paper ${i + 1}`;
    if (!paper || typeof paper !== "object") return `${where}: must be an object.`;
    if (!paper.key || typeof paper.key !== "string") return `${where}: missing string "key".`;
    if (seenKeys.has(paper.key)) return `${where}: duplicate key "${paper.key}".`;
    seenKeys.add(paper.key);
    if (!paper.title || typeof paper.title !== "string") return `${where}: missing string "title".`;
    if (!Number.isInteger(paper.durationMinutes) || paper.durationMinutes <= 0) {
      return `${where}: "durationMinutes" must be a positive integer.`;
    }
    if (paper.group && typeof paper.group !== "string") return `${where}: "group" must be a string.`;
    if (paper.selector && typeof paper.selector !== "string") return `${where}: "selector" must be a string.`;
    const err = validateQuestions(paper.questions);
    if (err) return `${where}: ${err}`;
    for (const q of paper.questions) {
      if (allIds.has(q.id)) return `${where}: duplicate question id "${q.id}" across papers.`;
      allIds.add(q.id);
    }
  }
  return null;
}

export async function POST(request) {
  const admin = await getCurrentUser();
  if (!admin || !admin.isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const form = await request.formData();
  const title = (form.get("title") || "").toString().trim();
  const description = (form.get("description") || "").toString().trim();
  const tags = [...new Map(
    (form.get("tags") || "")
      .toString()
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => [tag.toLocaleLowerCase(), tag]),
  ).values()];
  const type = (form.get("type") || "short").toString().trim();
  const durationMinutes = Number(form.get("durationMinutes"));
  const isPublished = form.get("isPublished") === "on";
  const isFree = form.get("isFree") === "on";
  const file = form.get("questionsFile");

  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (type !== "short" && type !== "full") {
    return NextResponse.json({ error: "Type must be 'short' or 'full'." }, { status: 400 });
  }
  if (type === "short" && (!durationMinutes || durationMinutes <= 0)) {
    return NextResponse.json({ error: "Duration (minutes) must be a positive number." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Upload a JSON file with the questions." }, { status: 400 });
  }

  const raw = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "That file isn't valid JSON." }, { status: 400 });
  }

  const id = crypto.randomUUID();

  if (type === "full") {
    const papers = normalizePapers(parsed);
    if (!papers) {
      return NextResponse.json({ error: "Full exam JSON must be an object with a \"papers\" array (or an array of papers)." }, { status: 400 });
    }
    const validationError = validatePapers(papers);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const { totalMarks, durationMinutes: totalDuration } = summarizePapers(papers);

    const exam = await prisma.exam.create({
      data: {
        id,
        title,
        description: description || null,
        tags,
        type: "full",
        durationMinutes: totalDuration,
        questions: [],
        papers,
        totalMarks,
        isPublished,
        isFree,
      },
    });
    return NextResponse.json({ id: exam.id });
  }

  const questions = normalizeQuestions(parsed);
  if (!questions) {
    return NextResponse.json({ error: "Short exam JSON must be an array of questions (or an object with a \"questions\" array)." }, { status: 400 });
  }
  const validationError = validateQuestions(questions);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const exam = await prisma.exam.create({
    data: { id, title, description: description || null, tags, type: "short", durationMinutes, totalMarks, questions, isPublished, isFree },
  });

  return NextResponse.json({ id: exam.id });
}
