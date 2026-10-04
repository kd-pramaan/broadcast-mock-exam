"use client";
import { useState } from "react";

const REGIONS = ["North", "South", "East", "West"];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", age: "", region: REGIONS[0] });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Registration failed."); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="wrap">
        <div className="card">
          <h1>Check your email</h1>
          <p>We sent a verification link to <b>{form.email}</b>. Open it to set your password.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>Register</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={onSubmit}>
          <label>Full name</label>
          <input className="input" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label>Email</label>
          <input className="input" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label>Age</label>
          <input className="input" type="number" min="14" max="100" required value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })} />

          <label>Region</label>
          <select className="input" value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <button className="btn" disabled={loading} type="submit">
            {loading ? "Submitting..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
