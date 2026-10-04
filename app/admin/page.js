import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth.js";
import { prisma } from "../../lib/db.js";
import Nav from "../../components/Nav.js";
import ActivateButton from "./ActivateButton.js";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/dashboard");

  const pending = await prisma.user.findMany({
    where: { status: "pending_approval" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <Nav isAdmin={user.isAdmin} />
      <div className="wrap">
        <div className="card">
          <h1>Pending payments</h1>
          {pending.length === 0 && <p className="muted">Nothing to review.</p>}
          {pending.length > 0 && (
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Region</th><th>Reference</th><th></th></tr>
              </thead>
              <tbody>
                {pending.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.region}</td>
                    <td>{u.paymentReference || <span className="muted">none given</span>}</td>
                    <td><ActivateButton userId={u.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
