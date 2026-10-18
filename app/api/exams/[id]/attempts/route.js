import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db.js";
import { getCurrentUser } from "../../../../../lib/auth.js";
import { stripQuestions, selectPapers, requiresPaperChoice } from "../../../../../lib/exams.js";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam || !exam.isPublished) {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }
  // Never trust the UI to have hidden the "Attempt" button - re-check the
  // plan gate server-side too.
  if (!exam.isFree && user.plan !== "paid") {
    return NextResponse.json({ error: "Upgrade to the paid plan to attempt this exam." }, { status: 403 });
  }

  let body = {};
  try { body = await request.json(); } catch { body = {}; }
  const paperChoice = body.paperChoice || null;

  if (exam.type === "full") {
    if (!paperChoice && requiresPaperChoice(exam.papers)) {
      return NextResponse.json({ error: "Select Radio Engineering or Television Engineering for Paper 2." }, { status: 400 });
    }
    const papers = selectPapers(exam.papers, paperChoice);
    if (papers.length === 0) {
      return NextResponse.json({ error: "This exam has no papers." }, { status: 400 });
    }
    const last = await prisma.attempt.findFirst({
      where: { userId: user.id, examId: exam.id },
      orderBy: { attemptNumber: "desc" },
    });
    const attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        examId: exam.id,
        attemptNumber: (last?.attemptNumber || 0) + 1,
        paperChoice,
      },
    });

    const safePapers = papers.map((p) => ({
      key: p.key,
      title: p.title,
      durationMinutes: p.durationMinutes,
      questions: stripQuestions(p.questions),
    }));

    return NextResponse.json({ attemptId: attempt.id, type: "full", papers: safePapers });
  }

  const last = await prisma.attempt.findFirst({
    where: { userId: user.id, examId: exam.id },
    orderBy: { attemptNumber: "desc" },
  });

  const attempt = await prisma.attempt.create({
    data: { userId: user.id, examId: exam.id, attemptNumber: (last?.attemptNumber || 0) + 1 },
  });

  // strip the answer key before sending questions to the browser
  const questions = stripQuestions(exam.questions);

  return NextResponse.json({
    attemptId: attempt.id,
    type: "short",
    durationMinutes: exam.durationMinutes,
    questions,
  });
}
