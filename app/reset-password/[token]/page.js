import Link from "next/link";
import { prisma } from "../../../lib/db.js";
import ResetPasswordForm from "./ResetPasswordForm.js";

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;
  const user = await prisma.user.findUnique({ where: { verifyToken: token } });

  if (!user) {
    return (
      <div className="auth-page-single">
        <section className="auth-page-card auth-page-card-single">
          <span className="auth-page-kicker">Account help</span>
          <h1>Link not valid</h1>
          <p className="auth-page-sub">This reset link is invalid or has already been used.</p>
          <Link className="auth-back" href="/forgot-password">Request a new link &rarr;</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-page-single">
      <section className="auth-page-card auth-page-card-single">
        <span className="auth-page-kicker">Account help</span>
        <h1>Reset your password</h1>
        <p className="auth-page-sub">Account: <b>{user.email}</b></p>
        <div className="auth-page-form">
          <ResetPasswordForm token={token} />
        </div>
        <Link className="auth-back" href="/login">&larr; Back to login</Link>
      </section>
    </div>
  );
}
