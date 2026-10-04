"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetPasswordForm({ token }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setLoading(true);
    const res = await fetch("/api/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Could not set password."); return; }
    router.push("/login?verified=1");
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <p className="error">{error}</p>}
      <label>New password</label>
      <input className="input" type="password" required value={password}
        onChange={(e) => setPassword(e.target.value)} />
      <button className="btn" disabled={loading} type="submit">
        {loading ? "Saving..." : "Set password & continue"}
      </button>
    </form>
  );
}
