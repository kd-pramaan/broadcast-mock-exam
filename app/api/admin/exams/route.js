import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "../../../../lib/db.js";
import { getCurrentUser } from "../../../../lib/auth.js";

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

export async function POST(request) {
  const admin = await getCurrentUser();
  if (!admin || !admin.isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const form = await request.formData();
  const title = (form.get("title") || "").toString().trim();
  const description = (form.get("description") || "").toString().trim();
  const durationMinutes = Number(form.get("durationMinutes"));
  const isPublished = form.get("isPublished") === "on";
  const file = form.get("questionsFile");

  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!durationMinutes || durationMinutes <= 0) {
    return NextResponse.json({ error: "Duration (minutes) must be a positive number." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Upload a JSON file with the questions." }, { status: 400 });
  }

  const raw = await file.text();
  let questions;
  try {
    questions = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "That file isn't valid JSON." }, { status: 400 });
  }
  const validationError = validateQuestions(questions);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const id = crypto.randomUUID();

  const exam = await prisma.exam.create({
    data: { id, title, description: description || null, durationMinutes, totalMarks, questions, isPublished },
  });

  return NextResponse.json({ id: exam.id });
}
