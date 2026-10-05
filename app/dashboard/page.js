import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../lib/auth.js";
import { prisma } from "../../lib/db.js";
import Nav from "../../components/Nav.js";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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
      <div className="exam-wrap">
        <div className="card exam-hero">
          <h1>Welcome, {user.name}</h1>
          <p className="muted">{user.email} - {user.region} region</p>
          <div className="exam-hero-grid">
            <div><span className="muted">Plan</span><b>{user.plan === "paid" ? "Paid - all papers" : user.plan === "pending_approval" ? "Upgrade pending" : "Basic - free paper"}</b></div>
            <div><span className="muted">Exams attempted</span><b>{examsAttempted}</b></div>
            <div><span className="muted">Average score (first attempts)</span><b>{avgPercent === null ? "-" : `${avgPercent}%`}</b></div>
          </div>
          <Link className="btn" href="/exams">Go to exams</Link>{" "}
          {user.plan === "basic" && <Link className="btn secondary" href="/pay">Upgrade plan</Link>}
        </div>
      </div>
    </div>
  );
}
