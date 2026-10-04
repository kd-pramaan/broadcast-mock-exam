"use client";
import { useState } from "react";

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setMsg(""); setLoading(true);
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Could not update password."); return; }
    setMsg("Password updated.");
    setCurrent(""); setNext("");
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <p className="error">{error}</p>}
      {msg && <p style={{ color: "var(--good)" }}>{msg}</p>}
      <label>Current password</label>
      <input className="input" type="password" required value={current}
        onChange={(e) => setCurrent(e.target.value)} />
      <label>New password</label>
      <input className="input" type="password" required value={next}
        onChange={(e) => setNext(e.target.value)} />
      <button className="btn" disabled={loading} type="submit">
        {loading ? "Saving..." : "Update password"}
      </button>
    </form>
  );
}
