import { getCurrentUser } from "../../lib/auth.js";
import Nav from "../../components/Nav.js";
import ContactForm from "./ContactForm.js";

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <div>
      {user && <Nav isAdmin={user.isAdmin} crumbs={[{ label: "Contact us" }]} />}
      <div className="wrap">
        <div className="card">
          <h1>Contact us</h1>
          <p className="muted">Have a question or ran into a problem? Send us a message below.</p>
          <ContactForm defaultEmail={user ? user.email : ""} loggedIn={!!user} />
        </div>
      </div>
    </div>
  );
}
