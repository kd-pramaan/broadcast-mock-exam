"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const REGIONS = ["North", "South", "East", "West"];

export default function HomeAuth({ user }) {
  const router = useRouter();
  const [tab, setTab] = useState("register");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    region: REGIONS[0],
    password: "",
    confirmPassword: "",
  });

  async function submitLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
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

  async function submitRegister(event) {
    event.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
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

  if (user) {
    const planLabel = user.plan === "paid"
      ? "Full access - all papers"
      : user.plan === "pending_approval"
        ? "Upgrade pending approval"
        : "Basic - free sample paper";

    return (
      <aside className="home-auth" aria-label="Your account">
        <span className="auth-eyebrow">Welcome back</span>
        <h2>{user.name}</h2>
        <p className="auth-sub">Your preparation is waiting.</p>
        <div className="auth-plan">
          <span>Current plan</span>
          <b>{planLabel}</b>
        </div>
        <Link className="btn auth-submit" href="/dashboard">Go to dashboard</Link>
        <Link className="auth-secondary" href="/exams">Browse mock exams &rarr;</Link>
        {user.plan !== "paid" && (
          <Link className="auth-upgrade" href="/pay">Unlock every paper for ₹199 &rarr;</Link>
        )}
        <div className="auth-note">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="#1a7f5a" strokeWidth="1.8" />
            <path d="m8.4 12.2 2.4 2.4 4.8-5" stroke="#1a7f5a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>New attempts are scored instantly, with your first-attempt rank on the leaderboard.</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="home-auth" aria-label="Log in or register">
      <div className="auth-head">
        <span className="auth-eyebrow">Your prep starts here</span>
        <h2>{tab === "register" ? "Create your free account" : "Welcome back"}</h2>
        <p className="auth-sub">
          {tab === "register"
            ? "Start with a free sample paper. No payment needed."
            : "Log in to continue your mock exams and scores."}
        </p>
      </div>

      <div className="auth-tabs" role="tablist" aria-label="Account action">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "login"}
          className={tab === "login" ? "active" : ""}
          onClick={() => { setTab("login"); setError(""); }}
        >
          Log in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "register"}
          className={tab === "register" ? "active" : ""}
          onClick={() => { setTab("register"); setError(""); }}
        >
          Register
        </button>
      </div>

      {error && <p className="error auth-error" role="alert">{error}</p>}

      {tab === "login" ? (
        <form className="auth-form" onSubmit={submitLogin}>
          <label htmlFor="home-login-email">Email</label>
          <input
            id="home-login-email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={login.email}
            onChange={(e) => setLogin({ ...login, email: e.target.value })}
          />
          <label htmlFor="home-login-password">Password</label>
          <input
            id="home-login-password"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={login.password}
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
          />
          <div className="auth-forgot">
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
          <button className="btn auth-submit" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
          <p className="auth-switch">
            New to MarQ?{" "}
            <button type="button" onClick={() => { setTab("register"); setError(""); }}>
              Create a free account
            </button>
          </p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={submitRegister}>
          <label htmlFor="home-register-name">Full name</label>
          <input
            id="home-register-name"
            className="input"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label htmlFor="home-register-email">Email</label>
          <input
            id="home-register-email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div className="auth-row">
            <div>
              <label htmlFor="home-register-age">Age</label>
              <input
                id="home-register-age"
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
              <label htmlFor="home-register-region">Region</label>
              <select
                id="home-register-region"
                className="input"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              >
                {REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
            </div>
          </div>
          <label htmlFor="home-register-password">Password</label>
          <input
            id="home-register-password"
            className="input"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <label htmlFor="home-register-confirm">Confirm password</label>
          <input
            id="home-register-confirm"
            className="input"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          <button className="btn auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create free account"}
          </button>
        </form>
      )}

      <div className="auth-note">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="#1a7f5a" strokeWidth="1.8" />
          <path d="m8.4 12.2 2.4 2.4 4.8-5" stroke="#1a7f5a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Free plan includes a full sample paper, exam timer, instant score and leaderboard rank.</span>
      </div>
    </aside>
  );
}
