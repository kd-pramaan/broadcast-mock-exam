"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Registration failed."); return; }
    router.push(data.redirect || "/dashboard");
    router.refresh();
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>Register</h1>
        <p className="muted">
          Create your account and start right away - you'll get free access to a sample paper on the Basic plan.
        </p>
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

          <label>Password</label>
          <input className="input" type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <label>Confirm password</label>
          <input className="input" type="password" required value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />

          <button className="btn" disabled={loading} type="submit">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
