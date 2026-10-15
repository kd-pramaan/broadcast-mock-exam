import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../lib/auth.js";
import { prisma } from "../../lib/db.js";
import Nav from "../../components/Nav.js";

const SUBJECT_ORDER = [
  "Full-length CBT mocks",
  "Broadcast Engineering",
  "Radio Engineering",
  "Television Engineering",
  "General Subjects",
  "Other papers",
];

function subjectOf(exam) {
  const title = exam.title.toLowerCase();
  if (title.includes("sea to ae") || title.includes("cbt")) return "Full-length CBT mocks";
  if (title.includes("broadcast")) return "Broadcast Engineering";
  if (title.includes("radio")) return "Radio Engineering";
  if (title.includes("television") || title.includes(" tv")) return "Television Engineering";
  if (title.includes("general")) return "General Subjects";
  return "Other papers";
}

export default async function ExamsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
  });
  const unlocked = user.plan === "paid";

  const buckets = new Map();
  for (const exam of exams) {
    const subject = subjectOf(exam);
    if (!buckets.has(subject)) buckets.set(subject, []);
    buckets.get(subject).push(exam);
  }
  const grouped = SUBJECT_ORDER.filter((subject) => buckets.has(subject)).map(
    (subject) => [subject, buckets.get(subject)],
  );

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
        {grouped.map(([subject, list]) => (
          <section className="exam-section" key={subject}>
            <h2 className="exam-section-title">{subject}</h2>
            <div className="exam-grid">
              {list.map((exam) => {
                const canAttempt = exam.isFree || unlocked;
                return (
                  <div key={exam.id} className="card">
                    <h2>
                      {exam.title}{" "}
                      {exam.isFree ? <span className="status-tag answered">Free</span> : !unlocked && <span className="status-tag unanswered">Locked</span>}
                    </h2>
                    <p className="muted">{exam.durationMinutes} minutes - {exam.totalMarks} marks</p>
                    <div className="exam-actions">
                      {canAttempt ? (
                        <Link className="btn" href={`/exams/${exam.id}`}>Attempt</Link>
                      ) : (
                        <Link className="btn" href="/pay">Upgrade to unlock</Link>
                      )}
                      <Link className="btn secondary" href={`/exams/${exam.id}/rank`}>Leaderboard</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
