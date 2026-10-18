import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "../../../../../../lib/auth.js";
import { prisma } from "../../../../../../lib/db.js";
import { getScoreBreakdown, NEGATIVE_MARK_RATIO } from "../../../../../../lib/scoring.js";
import { selectPapers } from "../../../../../../lib/exams.js";
import Nav from "../../../../../../components/Nav.js";
import UpgradeBanner from "../../../../../../components/UpgradeBanner.js";

function QuestionReview({ q, i, picked, reveal }) {
  const notAnswered = picked === undefined;
  const gotItRight = picked === q.correctIndex;
  let status;
  if (notAnswered) status = { cls: "unanswered", label: "Not answered" };
  else if (!reveal) status = { cls: "unanswered", label: "Answered" };
  else status = gotItRight ? { cls: "answered", label: "Correct" } : { cls: "incorrect", label: "Incorrect" };

  return (
    <div className="card">
      <div className="exam-q-subheader">
        <p style={{ fontWeight: 600, margin: 0 }}>{i + 1}. {q.text}</p>
        <span className={`status-tag ${status.cls}`}>{status.label}</span>
      </div>
      {q.options.map((opt, idx) => {
        const isCorrect = reveal && idx === q.correctIndex;
        const isPicked = idx === picked;
        const cls = isCorrect ? "correct" : isPicked ? (reveal ? "incorrect" : "picked") : "";
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
      {reveal && q.explanation && (
        <div className="explanation"><b>Explanation:</b> {q.explanation}</div>
      )}
    </div>
  );
}

export default async function ReviewPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id, attemptId } = await params;
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== user.id || attempt.examId !== id || !attempt.submittedAt) notFound();

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) notFound();

  const answers = attempt.answers || {};
  const reveal = user.plan === "paid";

  const isFull = exam.type === "full";
  const papers = isFull
    ? selectPapers(exam.papers, attempt.paperChoice)
    : [{ key: "main", title: exam.title, questions: exam.questions || [] }];

  const allQuestions = papers.flatMap((p) => p.questions || []);
  const breakdown = getScoreBreakdown(allQuestions, answers);
  const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div>
      <Nav isAdmin={user.isAdmin} crumbs={[{ label: "Exams", href: "/exams" }, { label: exam.title, href: `/exams/${id}` }, { label: "Review" }]} />
      <div className="wrap">
        <div className="card">
          <h1>{exam.title} - review (attempt {attempt.attemptNumber})</h1>
          <p className="scorecard-total">{attempt.score} / {totalMarks}</p>
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
          {!reveal && <UpgradeBanner />}
        </div>

        {papers.map((paper) => (
          <section key={paper.key}>
            {isFull && <h2 style={{ margin: "16px 0 8px" }}>{paper.title}</h2>}
            {(paper.questions || []).map((q, i) => (
              <QuestionReview key={q.id} q={q} i={i} picked={answers[q.id]} reveal={reveal} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
