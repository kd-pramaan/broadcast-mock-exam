import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "../../../../lib/auth.js";
import { prisma } from "../../../../lib/db.js";
import Nav from "../../../../components/Nav.js";

export default async function RankPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) notFound();

  // Ranking uses only each user's first attempt per exam, per the brief.
  const firstAttempts = await prisma.attempt.findMany({
    where: { examId: exam.id, attemptNumber: 1, submittedAt: { not: null } },
    include: { user: true },
    orderBy: { score: "desc" },
  });

  return (
    <div>
      <Nav isAdmin={user.isAdmin} crumbs={[{ label: "Exams", href: "/exams" }, { label: exam.title, href: `/exams/${exam.id}` }, { label: "Leaderboard" }]} />
      <div className="exam-wrap">
        <div className="card">
          <h1>{exam.title} - leaderboard</h1>
          <p className="muted">Ranked by first attempt only.</p>
          {firstAttempts.length === 0 && <p className="muted">No submitted attempts yet.</p>}
          {firstAttempts.length > 0 && (
            <table>
              <thead><tr><th>Rank</th><th>Name</th><th>Score</th></tr></thead>
              <tbody>
                {firstAttempts.map((a, i) => (
                  <tr key={a.id} style={a.userId === user.id ? { fontWeight: 700 } : undefined}>
                    <td>{i + 1}</td>
                    <td>{a.user.name}</td>
                    <td>{a.score} / {exam.totalMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
