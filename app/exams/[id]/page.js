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
      <div className="exam-wrap">
        <ExamRunner
          examId={exam.id}
          title={exam.title}
          durationMinutes={exam.durationMinutes}
          totalMarks={exam.totalMarks}
          questionCount={exam.questions.length}
          pastAttempts={pastAttempts.map((a) => ({
            id: a.id,
            attemptNumber: a.attemptNumber,
            score: a.score,
            submittedAt: a.submittedAt.toLocaleString(),
          }))}
        />
      </div>
    </div>
  );
}
