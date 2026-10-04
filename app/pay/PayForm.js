"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PayForm() {
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/payment/mark-paid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not submit.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <p className="error">{error}</p>}
      <label>Payment reference / UTR (optional, speeds up verification)</label>
      <input className="input" value={reference} onChange={(e) => setReference(e.target.value)} />
      <button className="btn" disabled={loading} type="submit">
        {loading ? "Submitting..." : "I've paid"}
      </button>
    </form>
  );
}
