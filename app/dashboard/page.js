import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../lib/auth.js";
import { prisma } from "../../lib/db.js";
import Nav from "../../components/Nav.js";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status !== "active") redirect("/pay");

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id, attemptNumber: 1, submittedAt: { not: null } },
    include: { exam: true },
  });

  const examsAttempted = attempts.length;
  const avgPercent = examsAttempted
    ? Math.round(
        attempts.reduce((sum, a) => sum + (a.score / a.exam.totalMarks) * 100, 0) / examsAttempted
      )
    : null;

  return (
    <div>
      <Nav isAdmin={user.isAdmin} />
      <div className="wrap">
        <div className="card">
          <h1>Welcome, {user.name}</h1>
          <p className="muted">{user.email} - {user.region} region</p>
        </div>
        <div className="card">
          <h2>Your performance</h2>
          <p>Exams attempted: <b>{examsAttempted}</b></p>
          <p>Average score (first attempts): <b>{avgPercent === null ? "-" : `${avgPercent}%`}</b></p>
          <Link className="btn" href="/exams">Go to exams</Link>
        </div>
      </div>
    </div>
  );
}
