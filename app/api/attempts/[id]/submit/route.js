import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db.js";
import { getCurrentUser } from "../../../../../lib/auth.js";
import { getScoreBreakdown } from "../../../../../lib/scoring.js";
import { getUserRank } from "../../../../../lib/rank.js";

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
  if (attempt.exam.type !== "short") {
    return NextResponse.json({ error: "This exam is submitted paper by paper." }, { status: 400 });
  }
  if (attempt.submittedAt) {
    return NextResponse.json({ error: "Already submitted." }, { status: 400 });
  }

  const { answers } = await request.json();
  // Server computes the score from the stored answer key - never trust a
  // client-supplied score.
  const breakdown = getScoreBreakdown(attempt.exam.questions, answers || {});

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: { answers, score: breakdown.score, submittedAt: new Date() },
  });

  const rank = await getUserRank(attempt.examId, user.id);

  return NextResponse.json({ ...breakdown, totalMarks: attempt.exam.totalMarks, rank });
}
