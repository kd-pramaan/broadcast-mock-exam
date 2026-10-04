import { prisma } from "../../../lib/db.js";
import SetPasswordForm from "./SetPasswordForm.js";

export default async function VerifyPage({ params }) {
  const { token } = await params;
  const user = await prisma.user.findUnique({ where: { verifyToken: token } });

  if (!user) {
    return (
      <div className="wrap">
        <div className="card">
          <h1>Link not valid</h1>
          <p>This verification link is invalid or has already been used.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>Set your password</h1>
        <p className="muted">Email verified: <b>{user.email}</b></p>
        <SetPasswordForm token={token} />
      </div>
    </div>
  );
}
