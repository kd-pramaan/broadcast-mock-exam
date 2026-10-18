import { prisma } from "./db.js";

// Leaderboard rank uses only each user's first attempt per exam (attemptNumber 1),
// matching the standalone leaderboard page. Ties keep insertion order.
export async function getUserRank(examId, userId) {
  const attempts = await prisma.attempt.findMany({
    where: { examId, attemptNumber: 1, submittedAt: { not: null } },
    orderBy: { score: "desc" },
    select: { userId: true },
  });
  const index = attempts.findIndex((a) => a.userId === userId);
  return index === -1
    ? { rank: null, total: attempts.length }
    : { rank: index + 1, total: attempts.length };
}
