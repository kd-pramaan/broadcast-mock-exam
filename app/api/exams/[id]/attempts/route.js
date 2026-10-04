import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db.js";
import { getCurrentUser } from "../../../../../lib/auth.js";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user || user.status !== "active") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam || !exam.isPublished) {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }

  const last = await prisma.attempt.findFirst({
    where: { userId: user.id, examId: exam.id },
    orderBy: { attemptNumber: "desc" },
  });

  const attempt = await prisma.attempt.create({
    data: { userId: user.id, examId: exam.id, attemptNumber: (last?.attemptNumber || 0) + 1 },
  });

  // strip the answer key before sending questions to the browser
  const questions = exam.questions.map(({ id, text, options }) => ({ id, text, options }));

  return NextResponse.json({
    attemptId: attempt.id,
    durationMinutes: exam.durationMinutes,
    questions,
  });
}
