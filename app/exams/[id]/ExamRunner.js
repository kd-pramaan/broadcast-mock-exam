"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NEGATIVE_MARK_RATIO } from "../../../lib/scoring.js";

export default function ExamRunner({ examId, title, durationMinutes, totalMarks, questionCount, pastAttempts }) {
  const router = useRouter();
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [attempt, setAttempt] = useState(null); // { attemptId, durationMinutes, questions }
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState(() => new Set());
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const attemptRef = useRef(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  // Guards against submit() firing twice (timer hitting 0 at the same
  // moment the Submit button is clicked, React re-running an effect, etc.)
  // - a second, already-submitted response has no score and was overwriting
  // the real result with a blank one.
  const submittedRef = useRef(false);

  async function start() {
    const res = await fetch(`/api/exams/${examId}/attempts`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Could not start attempt."); return; }
    submittedRef.current = false;
    setAttempt(data);
    attemptRef.current = data;
    setAnswers({});
    setMarked(new Set());
    setCurrent(0);
    setSecondsLeft(data.durationMinutes * 60);
    setPhase("running");
  }

  async function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    const a = attemptRef.current;
    const res = await fetch(`/api/attempts/${a.attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answersRef.current }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Could not submit."); return; }
    setResult(data);
    setPhase("done");
    router.refresh(); // pick up the new attempt in the past-attempts list
  }

  // Tick the clock. Side effects (clearing the interval, submitting) live
  // here, not inside the setSecondsLeft updater - an updater can run more
  // than once for the same tick (e.g. React Strict Mode), which would fire
  // submit() twice.
  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase === "running" && secondsLeft === 0) submit();
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
              <td>{a.score} / {totalMarks}</td>
              <td>{a.submittedAt}</td>
              <td><Link href={`/exams/${examId}/attempts/${a.id}/review`}>Review</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (phase === "idle") {
    return (
      <>
        <div className="card exam-hero">
          <h1>{title}</h1>
          <p className="muted">Read the instructions below, then start when you're ready.</p>
          <div className="exam-hero-grid">
            <div><span className="muted">Total questions</span><b>{questionCount}</b></div>
            <div><span className="muted">Total marks</span><b>{totalMarks}</b></div>
            <div><span className="muted">Time allowed</span><b>{durationMinutes} min</b></div>
            <div><span className="muted">Wrong answer</span><b>&minus;{NEGATIVE_MARK_RATIO * 100}% of that question's marks</b></div>
            <div><span className="muted">Skipped question</span><b>No penalty</b></div>
          </div>
          <button className="btn" onClick={start}>Start attempt</button>
        </div>
        {pastAttemptsPanel}
      </>
    );
  }

  if (phase === "done") {
    return (
      <div className="card">
        <h2>Result</h2>
        <p>Score: <b>{result.score} / {result.totalMarks}</b></p>
        <button className="btn" onClick={() => setPhase("idle")}>Back</button>
      </div>
    );
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");
  const questions = attempt.questions;
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

  return (
    <>
      <div className="card exam-top">
        <div className="exam-badges">
          <span className="exam-badge"><i className="dot answered" />Answered: {counts.answered}</span>
          <span className="exam-badge"><i className="dot marked" />Marked for review: {counts.marked}</span>
          <span className="exam-badge"><i className="dot unanswered" />Not answered: {counts.unanswered}</span>
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
          <button className="btn" style={{ width: "100%" }} onClick={() => { if (confirm("Submit the exam now?")) submit(); }}>Submit exam</button>
        </div>
      </div>
    </>
  );
}
