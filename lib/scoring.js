// Pure function: scores an attempt against the exam's stored answer key.
// Kept isolated from Prisma/Next so it's trivial to unit test (see test/scoring.test.js)
// and so the one place correctness matters - the server must never trust a
// client-computed score - has no other moving parts to go wrong.
export function scoreAttempt(questions, answers) {
  let score = 0;
  for (const q of questions) {
    if (answers && answers[q.id] === q.correctIndex) {
      score += q.marks;
    }
  }
  return score;
}
