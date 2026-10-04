import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth.js";
import { prisma } from "../../../lib/db.js";
import Nav from "../../../components/Nav.js";
import ExamRunner from "./ExamRunner.js";

export default async function ExamPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status !== "active") redirect("/pay");

  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam || !exam.isPublished) notFound();

  const pastAttempts = await prisma.attempt.findMany({
    where: { userId: user.id, examId: exam.id, submittedAt: { not: null } },
    orderBy: { attemptNumber: "asc" },
  });

  return (
    <div>
      <Nav isAdmin={user.isAdmin} />
      <div className="wrap">
        <div className="card">
          <h1>{exam.title}</h1>
          <p className="muted">
            {exam.durationMinutes} minutes - {exam.totalMarks} marks - attempt as many times as you like
          </p>
        </div>
        {pastAttempts.length > 0 && (
          <div className="card">
            <h2>Your past attempts</h2>
            <table>
              <thead><tr><th>#</th><th>Score</th><th>Submitted</th></tr></thead>
              <tbody>
                {pastAttempts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.attemptNumber}</td>
                    <td>{a.score} / {exam.totalMarks}</td>
                    <td>{new Date(a.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ExamRunner examId={exam.id} />
      </div>
    </div>
  );
}
