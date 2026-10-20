"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthPromo from "../../components/AuthPromo.js";

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
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      router.push(data.redirect || "/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page-grid">
        <AuthPromo mode="login" />

        <section className="auth-page-card">
          <span className="auth-page-kicker">Welcome back</span>
          <h1>Log in to MarQ</h1>
          <p className="auth-page-sub">Continue your mock exams, review your scores and climb the leaderboard.</p>

          {error && <p className="error" role="alert">{error}</p>}

          <form className="auth-page-form" onSubmit={onSubmit}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="auth-page-forgot">
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
            <button className="btn auth-page-submit" disabled={loading} type="submit">
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="auth-page-switch">
            New to MarQ? <Link href="/register">Create a free account</Link>
          </p>
          <div className="auth-page-note">
            <span className="auth-promo-dot"></span>
            Free access includes a full sample paper, exam timer and instant rank.
          </div>
        </section>
      </div>
    </div>
  );
}
