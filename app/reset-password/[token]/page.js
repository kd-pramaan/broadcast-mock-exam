import { prisma } from "../../../lib/db.js";
import ResetPasswordForm from "./ResetPasswordForm.js";

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;
  const user = await prisma.user.findUnique({ where: { verifyToken: token } });

  if (!user) {
    return (
      <div className="wrap">
        <div className="card">
          <h1>Link not valid</h1>
          <p>This reset link is invalid or has already been used.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>Reset your password</h1>
        <p className="muted">Account: <b>{user.email}</b></p>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
