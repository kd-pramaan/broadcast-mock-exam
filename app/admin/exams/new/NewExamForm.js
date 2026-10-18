"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewExamForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState("short");
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/exams", { method: "POST", body: new FormData(e.target) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not create exam.");
      return;
    }
    router.push(`/exams/${data.id}`);
    router.refresh();
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      {error && <p className="error">{error}</p>}

      <label>Title</label>
      <input className="input" name="title" required />

      <label>Description (optional)</label>
      <input className="input" name="description" />

      <label>Tags (optional, comma-separated)</label>
      <input
        className="input"
        name="tags"
        placeholder="e.g. Broadcast Engineering, Paper 1, SEA-AE"
      />

      <label>Type</label>
      <select
        className="input"
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ display: "block" }}
      >
        <option value="short">Short exam (single subject)</option>
        <option value="full">Full exam (multiple papers)</option>
      </select>

      {type === "short" && (
        <>
          <label>Duration (minutes)</label>
          <input className="input" name="durationMinutes" type="number" min="1" required />
        </>
      )}

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 400, margin: "6px 0 14px" }}>
        <input type="checkbox" name="isPublished" defaultChecked style={{ width: "auto" }} />
        Publish immediately
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 400, margin: "6px 0 14px" }}>
        <input type="checkbox" name="isFree" style={{ width: "auto" }} />
        Free sample paper (included in the Basic plan, no payment needed)
      </label>

      <label>Questions (JSON file)</label>
      <input className="input" name="questionsFile" type="file" accept="application/json,.json" required />
      {type === "short" ? (
        <p className="muted">
          An array of questions: <code>[{'{'} "id", "text", "options", "correctIndex", "marks", "explanation" {'}'}]</code>.
        </p>
      ) : (
        <p className="muted">
          An object with a <code>papers</code> array. Each paper:{" "}
          <code>{'{'} "key", "title", "durationMinutes", "questions", "group"?, "selector"? {'}'}</code>.
          Papers sharing a <code>group</code> are alternatives (e.g. Paper 2 radio/tv); use <code>selector</code> to tell them apart.
        </p>
      )}

      <button className="btn" disabled={loading} type="submit">
        {loading ? "Creating..." : "Create exam"}
      </button>
    </form>
  );
}
