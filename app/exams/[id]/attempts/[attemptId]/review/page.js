import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "../../../../../../lib/auth.js";
import { prisma } from "../../../../../../lib/db.js";
import { getScoreBreakdown, NEGATIVE_MARK_RATIO } from "../../../../../../lib/scoring.js";
import Nav from "../../../../../../components/Nav.js";

export default async function ReviewPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id, attemptId } = await params;
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== user.id || attempt.examId !== id || !attempt.submittedAt) notFound();

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) notFound();

  const answers = attempt.answers || {};
  const breakdown = getScoreBreakdown(exam.questions, answers);

  return (
    <div>
      <Nav isAdmin={user.isAdmin} crumbs={[{ label: "Exams", href: "/exams" }, { label: exam.title, href: `/exams/${id}` }, { label: "Review" }]} />
      <div className="wrap">
        <div className="card">
          <h1>{exam.title} - review (attempt {attempt.attemptNumber})</h1>
          <p className="muted">Score: <b>{attempt.score} / {exam.totalMarks}</b></p>
          <div className="exam-hero-grid">
            <div><span className="muted">Correct</span><b>{breakdown.correctCount}</b></div>
            <div><span className="muted">Wrong</span><b>{breakdown.wrongCount}</b></div>
            <div><span className="muted">Skipped</span><b>{breakdown.skippedCount}</b></div>
            <div><span className="muted">Marks earned</span><b>+{breakdown.marksEarned}</b></div>
            <div><span className="muted">Penalty</span><b>&minus;{breakdown.penalty}</b></div>
          </div>
          <p className="muted">
            Correct answers earn the question's marks; wrong answers lose {NEGATIVE_MARK_RATIO * 100}% of those marks;
            skipped questions have no penalty.
          </p>
        </div>

        {exam.questions.map((q, i) => {
          const picked = answers[q.id];
          const notAnswered = picked === undefined;
          const gotItRight = picked === q.correctIndex;
          return (
            <div className="card" key={q.id}>
              <div className="exam-q-subheader">
                <p style={{ fontWeight: 600, margin: 0 }}>{i + 1}. {q.text}</p>
                <span className={`status-tag ${notAnswered ? "unanswered" : gotItRight ? "answered" : "incorrect"}`}>
                  {notAnswered ? "Not answered" : gotItRight ? "Correct" : "Incorrect"}
                </span>
              </div>
              {q.options.map((opt, idx) => {
                const isCorrect = idx === q.correctIndex;
                const isPicked = idx === picked;
                const cls = isCorrect ? "correct" : isPicked ? "incorrect" : "";
                return (
                  <div key={idx} className={`exam-option ${cls}`}>
                    {opt}
                    <span>
                      {isPicked && <span className="status-tag unanswered">Your answer</span>}
                      {isCorrect && <span className="status-tag answered">Correct answer</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
