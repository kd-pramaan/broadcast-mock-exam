"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewExamForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

      <label>Duration (minutes)</label>
      <input className="input" name="durationMinutes" type="number" min="1" required />

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 400, margin: "6px 0 14px" }}>
        <input type="checkbox" name="isPublished" defaultChecked style={{ width: "auto" }} />
        Publish immediately
      </label>

      <label>Questions (JSON file)</label>
      <input className="input" name="questionsFile" type="file" accept="application/json,.json" required />

      <button className="btn" disabled={loading} type="submit">
        {loading ? "Creating..." : "Create exam"}
      </button>
    </form>
  );
}
