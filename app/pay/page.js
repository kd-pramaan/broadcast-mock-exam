import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth.js";
import PayForm from "./PayForm.js";

export default async function PayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status === "active") redirect("/dashboard");
  if (user.status === "pending_verification") redirect("/register");

  if (user.status === "pending_approval") {
    return (
      <div className="wrap">
        <div className="card">
          <h1>Payment submitted</h1>
          <p>
            Your payment is awaiting verification by an admin. You'll be able
            to reach the dashboard once it's confirmed - no action needed from you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="card">
        <h1>Complete your registration</h1>
        <p>Scan the QR code below to pay the registration fee, then submit your payment reference.</p>
        <img className="qr" src="/qr-code.png" alt="Payment QR code" />
        <PayForm />
      </div>
    </div>
  );
}
