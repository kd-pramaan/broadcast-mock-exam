import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth.js";
import Breadcrumbs from "../../components/Breadcrumbs.js";
import ChangePasswordForm from "./ChangePasswordForm.js";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <Breadcrumbs items={[{ label: "Profile" }]} />
      <div className="wrap">
        <div className="card">
          <h1>Profile</h1>
          <p>{user.name} - {user.email}</p>
        </div>
        <div className="card narrow">
          <h2>Change password</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
