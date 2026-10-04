"use client";
import { useState } from "react";

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
    setSent(true); // same message whether or not the account exists
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>Forgot password</h1>
        {sent ? (
          <p>If that email has an account, a reset link is on its way.</p>
        ) : (
          <form onSubmit={onSubmit}>
            <label>Email</label>
            <input className="input" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} />
            <button className="btn" disabled={loading} type="submit">
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
