// Pure function: scores an attempt against the exam's stored answer key.
// Kept isolated from Prisma/Next so it's trivial to unit test (see test/scoring.test.js)
// and so the one place correctness matters - the server must never trust a
// client-computed score - has no other moving parts to go wrong.

// Standard competitive-MCQ negative marking: a wrong answer costs a quarter
// of that question's marks; a skipped question costs nothing.
// ponytail: one fixed ratio for every exam, make it a per-exam field if a
// specific exam needs a different penalty.
export const NEGATIVE_MARK_RATIO = 0.25;

export function getScoreBreakdown(questions, answers) {
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let marksEarned = 0;
  let penalty = 0;

  for (const q of questions) {
    const picked = answers ? answers[q.id] : undefined;
    if (picked === undefined) {
      skippedCount++;
    } else if (picked === q.correctIndex) {
      correctCount++;
      marksEarned += q.marks;
    } else {
      wrongCount++;
      penalty += q.marks * NEGATIVE_MARK_RATIO;
    }
  }

  const round = (value) => Math.round(value * 100) / 100;
  const roundedMarksEarned = round(marksEarned);
  const roundedPenalty = round(penalty);

  return {
    correctCount,
    wrongCount,
    skippedCount,
    marksEarned: roundedMarksEarned,
    penalty: roundedPenalty,
    score: round(marksEarned - penalty),
  };
}

export function scoreAttempt(questions, answers) {
  return getScoreBreakdown(questions, answers).score;
}
