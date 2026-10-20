"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthPromo from "../../components/AuthPromo.js";

const REGIONS = ["North", "South", "East", "West"];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "", email: "", age: "", region: REGIONS[0], password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords don't match."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
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
        <AuthPromo mode="register" />

        <section className="auth-page-card">
          <span className="auth-page-kicker">Free account</span>
          <h1>Start with a free paper</h1>
          <p className="auth-page-sub">
            Create your account in under two minutes. No payment, no card - your first full sample paper is included.
          </p>

          {error && <p className="error" role="alert">{error}</p>}

          <form className="auth-page-form" onSubmit={onSubmit}>
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              className="input"
              autoComplete="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              className="input"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <div className="auth-page-row">
              <div>
                <label htmlFor="register-age">Age</label>
                <input
                  id="register-age"
                  className="input"
                  type="number"
                  min="14"
                  max="100"
                  required
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="register-region">Region</label>
                <select
                  id="register-region"
                  className="input"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                >
                  {REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
                </select>
              </div>
            </div>

            <div className="auth-page-row">
              <div>
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="register-confirm">Confirm password</label>
                <input
                  id="register-confirm"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <button className="btn auth-page-submit" disabled={loading} type="submit">
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p className="auth-page-switch">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
