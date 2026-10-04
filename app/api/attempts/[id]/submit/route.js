import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db.js";
import { getCurrentUser } from "../../../../../lib/auth.js";
import { scoreAttempt } from "../../../../../lib/scoring.js";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { id } = await params;
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { exam: true },
  });
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  }
  if (attempt.submittedAt) {
    return NextResponse.json({ error: "Already submitted." }, { status: 400 });
  }

  const { answers } = await request.json();
  // Server computes the score from the stored answer key - never trust a
  // client-supplied score.
  const score = scoreAttempt(attempt.exam.questions, answers || {});

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: { answers, score, submittedAt: new Date() },
  });

  return NextResponse.json({ score, totalMarks: attempt.exam.totalMarks });
}
