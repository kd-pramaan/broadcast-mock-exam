"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Login failed."); return; }
    router.push(data.redirect || "/dashboard");
    router.refresh();
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>Log in</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input className="input" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <label>Password</label>
          <input className="input" type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <button className="btn" disabled={loading} type="submit">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="muted"><a href="/forgot-password">Forgot password?</a></p>
      </div>
    </div>
  );
}
