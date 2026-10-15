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
          <h1>Unlock every mock exam</h1>
          <p className="muted">
            Build confidence with more practice and prepare at your own pace. Upgrade
            from the free sample paper to full mock-exam access with one simple payment.
          </p>
          <h2>Full access for just ₹200</h2>
          <p className="muted">One-time payment. No recurring subscription.</p>
          <p>Scan the QR code to pay ₹200, then submit your payment reference to get started.</p>
          <img className="qr" src="/qr-code.png" alt="Payment QR code" />
          <PayForm />
        </div>
      </div>
    </div>
  );
}
