import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth.js";
import { prisma } from "../../../lib/db.js";
import Nav from "../../../components/Nav.js";
import ExamRunner from "./ExamRunner.js";

export default async function ExamPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam || !exam.isPublished) notFound();
  if (!exam.isFree && user.plan !== "paid") redirect("/pay");

  const isFull = exam.type === "full";

  const papers = isFull
    ? (exam.papers || []).map((p) => ({
        key: p.key,
        title: p.title,
        group: p.group || null,
        selector: p.selector || null,
        durationMinutes: p.durationMinutes,
        questionCount: (p.questions || []).length,
        totalMarks: (p.questions || []).reduce((sum, q) => sum + q.marks, 0),
      }))
    : null;

  const pastAttempts = await prisma.attempt.findMany({
    where: { userId: user.id, examId: exam.id, submittedAt: { not: null } },
    orderBy: { attemptNumber: "asc" },
  });

  const examForRunner = {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    type: exam.type,
    durationMinutes: exam.durationMinutes,
    totalMarks: exam.totalMarks,
    questionCount: isFull ? null : (exam.questions || []).length,
    papers,
  };

  return (
    <div>
      <Nav isAdmin={user.isAdmin} crumbs={[{ label: "Exams", href: "/exams" }, { label: exam.title }]} />
      <div className="exam-wrap">
        <ExamRunner
          exam={examForRunner}
          plan={user.plan}
          pastAttempts={pastAttempts.map((a) => ({
            id: a.id,
            attemptNumber: a.attemptNumber,
            score: a.score,
            totalMarks: exam.totalMarks,
            submittedAt: a.submittedAt.toLocaleString(),
          }))}
        />
      </div>
    </div>
  );
}
