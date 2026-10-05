import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../lib/auth.js";
import { prisma } from "../../lib/db.js";
import Nav from "../../components/Nav.js";

export default async function ExamsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
  });
  const unlocked = user.plan === "paid";

  return (
    <div>
      <Nav isAdmin={user.isAdmin} crumbs={[{ label: "Exams" }]} />
      <div className="exam-wrap">
        <div className="card">
          <h1>Mock exams</h1>
          {exams.length === 0 && <p className="muted">No exams published yet.</p>}
          {!unlocked && (
            <p className="muted">
              You're on the Basic plan - free papers are marked below. <Link href="/pay">Upgrade</Link> to unlock the rest.
            </p>
          )}
        </div>
        <div className="exam-grid">
          {exams.map((exam) => {
            const canAttempt = exam.isFree || unlocked;
            return (
              <div key={exam.id} className="card">
                <h2>
                  {exam.title}{" "}
                  {exam.isFree ? <span className="status-tag answered">Free</span> : !unlocked && <span className="status-tag unanswered">Locked</span>}
                </h2>
                <p className="muted">{exam.durationMinutes} minutes - {exam.totalMarks} marks</p>
                {canAttempt ? (
                  <Link className="btn" href={`/exams/${exam.id}`}>Attempt</Link>
                ) : (
                  <Link className="btn" href="/pay">Upgrade to unlock</Link>
                )}{" "}
                <Link className="btn secondary" href={`/exams/${exam.id}/rank`}>Leaderboard</Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
