"use client";
import { useState } from "react";

export default function ContactForm({ defaultEmail, loggedIn }) {
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Could not send your message."); return; }
    setSent(true);
  }

  if (sent) {
    return <p>Thanks - we've got your message and will get back to you by email.</p>;
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <p className="error">{error}</p>}

      <label>Your email</label>
      <input
        className="input"
        type="email"
        required
        value={email}
        disabled={loggedIn}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Message</label>
      <textarea
        className="input"
        rows={6}
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button className="btn" disabled={loading} type="submit">
        {loading ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
