"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="auth-page-single">
      <section className="auth-page-card auth-page-card-single">
        <span className="auth-page-kicker">Account help</span>
        <h1>Forgot password</h1>
        <p className="auth-page-sub">
          Enter the email linked to your MarQ account and we will send you a reset link.
        </p>

        {sent ? (
          <>
            <p>If that email has an account, a reset link is on its way.</p>
            <p className="auth-simple-note">Check your spam folder if it does not arrive within a few minutes.</p>
          </>
        ) : (
          <form className="auth-page-form" onSubmit={onSubmit}>
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn auth-page-submit" disabled={loading} type="submit">
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <Link className="auth-back" href="/login">&larr; Back to login</Link>
      </section>
    </div>
  );
}
