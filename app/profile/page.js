import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth.js";
import Nav from "../../components/Nav.js";
import ChangePasswordForm from "./ChangePasswordForm.js";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.status !== "active") redirect("/pay");

  return (
    <div>
      <Nav isAdmin={user.isAdmin} />
      <div className="wrap">
        <div className="card">
          <h1>Profile</h1>
          <p>{user.name} - {user.email}</p>
        </div>
        <div className="card">
          <h2>Change password</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
