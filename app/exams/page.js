import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../lib/auth.js";
import { prisma } from "../../lib/db.js";
import Nav from "../../components/Nav.js";

export default async function ExamsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status !== "active") redirect("/pay");

  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <Nav isAdmin={user.isAdmin} />
      <div className="wrap">
        <div className="card">
          <h1>Mock exams</h1>
          {exams.length === 0 && <p className="muted">No exams published yet.</p>}
        </div>
        {exams.map((exam) => (
          <div key={exam.id} className="card">
            <h2>{exam.title}</h2>
            <p className="muted">{exam.durationMinutes} minutes - {exam.totalMarks} marks</p>
            <Link className="btn" href={`/exams/${exam.id}`}>Attempt</Link>{" "}
            <Link className="btn secondary" href={`/exams/${exam.id}/rank`}>Leaderboard</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
