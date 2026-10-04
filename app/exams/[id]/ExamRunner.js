"use client";
import { useEffect, useRef, useState } from "react";

export default function ExamRunner({ examId }) {
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [attempt, setAttempt] = useState(null); // { attemptId, durationMinutes, questions }
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const attemptRef = useRef(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  async function start() {
    const res = await fetch(`/api/exams/${examId}/attempts`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Could not start attempt."); return; }
    setAttempt(data);
    attemptRef.current = data;
    setAnswers({});
    setSecondsLeft(data.durationMinutes * 60);
    setPhase("running");
  }

  async function submit() {
    clearInterval(timerRef.current);
    const a = attemptRef.current;
    const res = await fetch(`/api/attempts/${a.attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answersRef.current }),
    });
    const data = await res.json();
    setResult(data);
    setPhase("done");
  }

  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          submit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "idle") {
    return (
      <div className="card">
        <button className="btn" onClick={start}>Start attempt</button>
      </div>
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

  return (
    <div className="card">
      <p className="pill">Time left: {mins}:{secs}</p>
      {attempt.questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 18 }}>
          <p><b>{i + 1}. {q.text}</b></p>
          {q.options.map((opt, idx) => (
            <label key={idx} style={{ display: "block", fontWeight: 400 }}>
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === idx}
                onChange={() => setAnswers({ ...answers, [q.id]: idx })}
              />{" "}{opt}
            </label>
          ))}
        </div>
      ))}
      <button className="btn" onClick={submit}>Submit</button>
    </div>
  );
}
