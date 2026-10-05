import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../lib/auth.js";
import { prisma } from "../../lib/db.js";
import Nav from "../../components/Nav.js";
import ActivateButton from "./ActivateButton.js";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/dashboard");

  const pending = await prisma.user.findMany({
    where: { plan: "pending_approval" },
    orderBy: { createdAt: "asc" },
  });

  const contactMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <Nav isAdmin={user.isAdmin} crumbs={[{ label: "Admin" }]} />
      <div className="exam-wrap">
        <div className="card">
          <h1>Exams</h1>
          <Link className="btn" href="/admin/exams/new">+ New exam</Link>
        </div>
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
        <div className="card">
          <h1>Contact us messages</h1>
          <p className="muted">No emails are sent by the app - reply by hand using the address shown.</p>
          {contactMessages.length === 0 && <p className="muted">Nothing yet.</p>}
          {contactMessages.length > 0 && (
            <table>
              <thead><tr><th>From</th><th>Message</th><th>Received</th></tr></thead>
              <tbody>
                {contactMessages.map((m) => (
                  <tr key={m.id}>
                    <td><a href={`mailto:${m.email}`}>{m.email}</a></td>
                    <td style={{ whiteSpace: "pre-wrap" }}>{m.message}</td>
                    <td>{m.createdAt.toLocaleString()}</td>
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
