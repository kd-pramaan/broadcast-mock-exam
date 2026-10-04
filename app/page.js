import Link from "next/link";

export default function Home() {
  return (
    <div className="wrap">
      <div className="card">
        <h1>Broadcast Engineering Mock Exam</h1>
        <p className="muted">
          Register, verify your email, complete payment, and start practicing
          once your account is activated.
        </p>
        <p>
          <Link className="btn" href="/register">Register</Link>{" "}
          <Link className="btn secondary" href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
