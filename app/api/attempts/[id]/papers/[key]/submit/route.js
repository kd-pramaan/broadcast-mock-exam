import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/db.js";
import { getCurrentUser } from "../../../../../../../lib/auth.js";
import { getScoreBreakdown, roundScore } from "../../../../../../../lib/scoring.js";
import { selectPapers } from "../../../../../../../lib/exams.js";
import { getUserRank } from "../../../../../../../lib/rank.js";

// Submits a single paper of a full exam. Answers are merged into the attempt as
// the candidate works through papers; the last paper finalises the attempt and
// returns the overall scorecard + leaderboard rank.
export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { id, key } = await params;
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: { exam: true },
  });
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  }
  if (attempt.exam.type !== "full") {
    return NextResponse.json({ error: "This exam is submitted all at once." }, { status: 400 });
  }
  if (attempt.submittedAt) {
    return NextResponse.json({ error: "Already submitted." }, { status: 400 });
  }

  const { answers: incoming } = await request.json();
  const papers = selectPapers(attempt.exam.papers, attempt.paperChoice);
  const paperIndex = papers.findIndex((p) => p.key === key);
  if (paperIndex === -1) {
    return NextResponse.json({ error: "Paper not found." }, { status: 404 });
  }

  const current = attempt.answers || {};
  const merged = { ...current, ...(incoming || {}) };

  const paper = papers[paperIndex];
  const breakdown = getScoreBreakdown(paper.questions, merged);
  const totalMarks = (paper.questions || []).reduce((sum, q) => sum + q.marks, 0);
  const paperScore = { key: paper.key, title: paper.title, totalMarks, ...breakdown };

  const existing = Array.isArray(attempt.paperScores) ? attempt.paperScores : [];
  const paperScores = [...existing.filter((p) => p.key !== paper.key), paperScore];

  const isLast = paperIndex === papers.length - 1;

  let score = null;
  let submittedAt = null;
  let overall = null;
  if (isLast) {
    score = roundScore(paperScores.reduce((sum, p) => sum + p.score, 0));
    submittedAt = new Date();
    overall = {
      score,
      totalMarks: paperScores.reduce((sum, p) => sum + p.totalMarks, 0),
    };
  }

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      answers: merged,
      paperScores,
      score: isLast ? score : null,
      submittedAt: isLast ? submittedAt : null,
    },
  });

  if (!isLast) {
    return NextResponse.json({ finished: false, paper: paperScore });
  }

  const rank = await getUserRank(attempt.examId, user.id);
  return NextResponse.json({ finished: true, ...overall, paperScores, rank });
}
