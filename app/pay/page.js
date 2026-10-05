import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth.js";
import Nav from "../../components/Nav.js";
import PayForm from "./PayForm.js";

export default async function PayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.plan === "paid") redirect("/dashboard");

  if (user.plan === "pending_approval") {
    return (
      <div>
        <Nav isAdmin={user.isAdmin} crumbs={[{ label: "Upgrade" }]} />
        <div className="wrap">
          <div className="card">
            <h1>Payment submitted</h1>
            <p>
              Your payment is awaiting verification by an admin. You'll get access to
              every paper once it's confirmed - no action needed from you in the meantime.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav isAdmin={user.isAdmin} crumbs={[{ label: "Upgrade" }]} />
      <div className="wrap">
        <div className="card">
          <h1>Upgrade to the paid plan</h1>
          <p className="muted">
            You're on the Basic plan, with free access to our sample paper. Pay the
            one-time fee below to unlock every mock exam.
          </p>
          <p>Scan the QR code below to pay, then submit your payment reference.</p>
          <img className="qr" src="/qr-code.png" alt="Payment QR code" />
          <PayForm />
        </div>
      </div>
    </div>
  );
}
