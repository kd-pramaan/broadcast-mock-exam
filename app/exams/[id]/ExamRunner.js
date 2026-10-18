"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NEGATIVE_MARK_RATIO } from "../../../lib/scoring.js";
import UpgradeBanner from "../../../components/UpgradeBanner.js";

export default function ExamRunner({ exam, plan, pastAttempts }) {
  const router = useRouter();
  const [phase, setPhase] = useState("idle"); // idle | running | paperDone | done
  const [choice, setChoice] = useState(null);
  const [attempt, setAttempt] = useState(null); // { attemptId, type, durationMinutes?, questions?, papers? }
  const [paperIndex, setPaperIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState(() => new Set());
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paperResult, setPaperResult] = useState(null);
  const [result, setResult] = useState(null);
  const [rank, setRank] = useState(null);
  const timerRef = useRef(null);
  const attemptRef = useRef(null);
  const paperIndexRef = useRef(0);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  // Guards against submit() firing twice (timer hitting 0 at the same
  // moment the Submit button is clicked, React re-running an effect, etc.).
  const submittedRef = useRef(false);

  const isFull = exam.type === "full";
  const activePapers = isFull && attempt ? attempt.papers : null;
  const activePaper = activePapers ? activePapers[paperIndex] : null;
  const questions = activePaper ? activePaper.questions : attempt ? attempt.questions : null;

  async function start() {
    const body = isFull ? { paperChoice: choice } : {};
    const res = await fetch(`/api/exams/${exam.id}/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Could not start attempt."); return; }
    submittedRef.current = false;
    setAttempt(data);
    attemptRef.current = data;
    setAnswers({});
    setMarked(new Set());
    setCurrent(0);
    setPaperIndex(0);
    paperIndexRef.current = 0;
    setPaperResult(null);
    setResult(null);
    setRank(null);
    const dur = isFull ? data.papers[0].durationMinutes : data.durationMinutes;
    setSecondsLeft(dur * 60);
    setPhase("running");
  }

  async function submitPaper() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    const a = attemptRef.current;
    const body = JSON.stringify({ answers: answersRef.current });

    if (!isFull) {
      const res = await fetch(`/api/attempts/${a.attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();
      if (!res.ok) { submittedRef.current = false; alert(data.error || "Could not submit."); return; }
      setResult(data);
      setRank(data.rank);
      setPhase("done");
      router.refresh();
      return;
    }

    const paperKey = a.papers[paperIndexRef.current].key;
    const res = await fetch(`/api/attempts/${a.attemptId}/papers/${paperKey}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json();
    if (!res.ok) { submittedRef.current = false; alert(data.error || "Could not submit."); return; }

    if (data.finished) {
      setResult(data);
      setRank(data.rank);
      setPhase("done");
    } else {
      setPaperResult(data.paper);
      setPhase("paperDone");
    }
    router.refresh();
  }

  function continueToNextPaper() {
    const nextIdx = paperIndex + 1;
    setPaperIndex(nextIdx);
    paperIndexRef.current = nextIdx;
    setCurrent(0);
    setMarked(new Set());
    setPaperResult(null);
    submittedRef.current = false;
    setSecondsLeft(attemptRef.current.papers[nextIdx].durationMinutes * 60);
    setPhase("running");
  }

  // Tick the clock. Side effects (clearing the interval, submitting) live in
  // the auto-submit effect, not inside the setSecondsLeft updater - an updater
  // can run more than once for the same tick (e.g. React Strict Mode).
  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, paperIndex]);

  useEffect(() => {
    if (phase === "running" && secondsLeft === 0) submitPaper();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  const pastAttemptsPanel = pastAttempts.length > 0 && (
    <div className="card">
      <h2>Your past attempts</h2>
      <table>
        <thead><tr><th>#</th><th>Score</th><th>Submitted</th><th></th></tr></thead>
        <tbody>
          {pastAttempts.map((a) => (
            <tr key={a.id}>
              <td>{a.attemptNumber}</td>
              <td>{a.score} / {a.totalMarks}</td>
              <td>{a.submittedAt}</td>
              <td><Link href={`/exams/${exam.id}/attempts/${a.id}/review`}>Review</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (phase === "idle") {
    const paper2Options = isFull
      ? exam.papers.filter((p) => p.group)
      : [];

    return (
      <>
        <div className="card exam-hero">
          <h1>{exam.title}</h1>
          <p className="muted">{exam.description || "Read the instructions below, then start when you're ready."}</p>
          <div className="exam-hero-grid">
            {isFull ? (
              <>
                <div><span className="muted">Papers</span><b>{exam.papers.length}</b></div>
                <div><span className="muted">Total marks</span><b>{exam.totalMarks}</b></div>
                <div><span className="muted">Per paper</span><b>{exam.papers[0]?.durationMinutes} min</b></div>
                <div><span className="muted">Wrong answer</span><b>&minus;{NEGATIVE_MARK_RATIO * 100}% of marks</b></div>
                <div><span className="muted">Skipped question</span><b>No penalty</b></div>
              </>
            ) : (
              <>
                <div><span className="muted">Total questions</span><b>{exam.questionCount}</b></div>
                <div><span className="muted">Total marks</span><b>{exam.totalMarks}</b></div>
                <div><span className="muted">Time allowed</span><b>{exam.durationMinutes} min</b></div>
                <div><span className="muted">Wrong answer</span><b>&minus;{NEGATIVE_MARK_RATIO * 100}% of that question's marks</b></div>
                <div><span className="muted">Skipped question</span><b>No penalty</b></div>
              </>
            )}
          </div>

          {isFull && (
            <div className="card" style={{ marginBottom: 0, borderColor: "var(--border)", boxShadow: "none" }}>
              <h2 style={{ marginTop: 0 }}>Paper sequence</h2>
              <ol className="paper-list">
                {exam.papers.map((p) => (
                  <li key={p.key}>
                    <b>{p.title}</b>
                    {p.group && <span className="status-tag marked" style={{ marginLeft: 8 }}>choose one</span>}
                    <span className="muted"> - {p.questionCount} questions, {p.totalMarks} marks, {p.durationMinutes} min</span>
                  </li>
                ))}
              </ol>

              {paper2Options.length > 0 && (
                <>
                  <h3>Select Paper 2 option</h3>
                  <div className="paper-choice-grid">
                    {paper2Options.map((p) => (
                      <label
                        key={p.key}
                        className={`paper-choice ${choice === p.selector ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="paper2"
                          value={p.selector}
                          checked={choice === p.selector}
                          onChange={() => setChoice(p.selector)}
                        />
                        <b>{p.title}</b>
                        <span className="muted">{p.questionCount} questions - {p.totalMarks} marks</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <p className="muted">
                You will see a mini score after each paper before moving on to the next.
                The detailed scorecard and leaderboard rank appear after the final paper.
              </p>
            </div>
          )}

          <button className="btn" onClick={start} disabled={isFull && paper2Options.length > 0 && !choice}>
            {isFull ? "Start Paper 1" : "Start attempt"}
          </button>
        </div>
        {pastAttemptsPanel}
      </>
    );
  }

  if (phase === "paperDone") {
    const nextPaper = activePapers[paperIndex + 1];
    return (
      <div className="card result-card">
        <h2>{paperResult.title} - complete</h2>
        <p className="scorecard-total">{paperResult.score} / {paperResult.totalMarks}</p>
        <div className="exam-hero-grid">
          <div><span className="muted">Correct</span><b>{paperResult.correctCount}</b></div>
          <div><span className="muted">Wrong</span><b>{paperResult.wrongCount}</b></div>
          <div><span className="muted">Skipped</span><b>{paperResult.skippedCount}</b></div>
          <div><span className="muted">Marks earned</span><b>+{paperResult.marksEarned}</b></div>
          <div><span className="muted">Penalty</span><b>&minus;{paperResult.penalty}</b></div>
        </div>
        <p className="muted">Next up: <b>{nextPaper.title}</b>. Your answers for this paper are saved.</p>
        <button className="btn" onClick={continueToNextPaper}>Continue to {nextPaper.title}</button>
      </div>
    );
  }

  if (phase === "done") {
    const reviewHref = `/exams/${exam.id}/attempts/${attempt.attemptId}/review`;
    const revealed = plan === "paid";
    return (
      <div className="card result-card">
        <h2>{isFull ? "Exam submitted" : "Result"}</h2>
        <p className="scorecard-total">{result.score} / {result.totalMarks}</p>
        {rank && rank.rank && (
          <p className="muted" style={{ marginTop: 0 }}>
            Leaderboard rank: <b>#{rank.rank}</b> of {rank.total} (first attempts only)
          </p>
        )}

        {isFull && result.paperScores && (
          <table>
            <thead>
              <tr><th>Paper</th><th>Correct</th><th>Wrong</th><th>Skipped</th><th>Score</th></tr>
            </thead>
            <tbody>
              {result.paperScores.map((p) => (
                <tr key={p.key}>
                  <td>{p.title}</td>
                  <td>{p.correctCount}</td>
                  <td>{p.wrongCount}</td>
                  <td>{p.skippedCount}</td>
                  <td>{p.score} / {p.totalMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isFull && (
          <div className="exam-hero-grid">
            <div><span className="muted">Correct</span><b>{result.correctCount}</b></div>
            <div><span className="muted">Wrong</span><b>{result.wrongCount}</b></div>
            <div><span className="muted">Skipped</span><b>{result.skippedCount}</b></div>
            <div><span className="muted">Marks earned</span><b>+{result.marksEarned}</b></div>
            <div><span className="muted">Penalty</span><b>&minus;{result.penalty}</b></div>
          </div>
        )}

        <p className="muted">
          Correct answers earn the question's marks; wrong answers lose {NEGATIVE_MARK_RATIO * 100}% of those marks;
          skipped questions have no penalty.
        </p>

        <div className="exam-actions" style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <Link className="btn" href={reviewHref}>
            {revealed ? "Review answers & explanations" : "Review answers"}
          </Link>
          <button className="btn secondary" onClick={() => { setPhase("idle"); }}>Back to instructions</button>
        </div>
        {!revealed && <UpgradeBanner />}
      </div>
    );
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const q = questions[current];

  // a marked question shows as "marked" even if answered; otherwise
  // it's "answered" when a choice is picked, else "unanswered" (no color).
  function statusOf(qid) {
    if (marked.has(qid)) return "marked";
    if (answers[qid] !== undefined) return "answered";
    return "unanswered";
  }
  const counts = { answered: 0, marked: 0, unanswered: 0 };
  questions.forEach((qq) => counts[statusOf(qq.id)]++);

  function toggleMarked(qid) {
    const next = new Set(marked);
    next.has(qid) ? next.delete(qid) : next.add(qid);
    setMarked(next);
  }
  function goTo(i) { setCurrent(Math.max(0, Math.min(questions.length - 1, i))); }

  const submitLabel = isFull
    ? (paperIndex < activePapers.length - 1 ? "Submit paper" : "Submit exam")
    : "Submit exam";

  return (
    <>
      <div className="card exam-top">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {activePaper && (
            <span className="status-tag marked" style={{ alignSelf: "flex-start" }}>
              {activePaper.title}{isFull ? ` (Paper ${paperIndex + 1} of ${activePapers.length})` : ""}
            </span>
          )}
          <div className="exam-badges">
            <span className="exam-badge"><i className="dot answered" />Answered: {counts.answered}</span>
            <span className="exam-badge"><i className="dot marked" />Marked for review: {counts.marked}</span>
            <span className="exam-badge"><i className="dot unanswered" />Not answered: {counts.unanswered}</span>
          </div>
        </div>
        <div className="exam-timer">Time left: {mins}:{secs}</div>
      </div>

      <div className="exam-layout">
        <div className="card exam-question-panel">
          <div className="exam-q-subheader">
            <b>Question {current + 1} of {questions.length}</b>
            <span className={`status-tag ${statusOf(q.id)}`}>
              {statusOf(q.id) === "answered" ? "Answered" : statusOf(q.id) === "marked" ? "Marked for review" : "Not answered"}
            </span>
          </div>

          <p style={{ fontWeight: 600 }}>{q.text}</p>
          {q.options.map((opt, idx) => (
            <label key={idx} className="exam-option">
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === idx}
                onChange={() => setAnswers({ ...answers, [q.id]: idx })}
              />
              {opt}
            </label>
          ))}

          <div className="exam-subfooter">
            <button className="btn secondary" onClick={() => goTo(current - 1)} disabled={current === 0}>Previous</button>
            <button className="btn secondary" onClick={() => { const n = { ...answers }; delete n[q.id]; setAnswers(n); }}>Clear response</button>
            <button className="btn secondary" onClick={() => { toggleMarked(q.id); goTo(current + 1); }}>Mark for review & next</button>
            <button className="btn" onClick={() => goTo(current + 1)} disabled={current === questions.length - 1}>Save & next</button>
          </div>
        </div>

        <div className="card exam-palette-panel">
          <h2 style={{ marginTop: 0 }}>Question palette</h2>
          <div className="exam-palette">
            {questions.map((qq, i) => (
              <button
                key={qq.id}
                className={`exam-qbtn ${statusOf(qq.id)} ${i === current ? "current" : ""}`}
                onClick={() => goTo(i)}
                title={`Question ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button className="btn" style={{ width: "100%" }} onClick={() => { if (confirm(`${submitLabel} now?`)) submitPaper(); }}>{submitLabel}</button>
        </div>
      </div>
    </>
  );
}
