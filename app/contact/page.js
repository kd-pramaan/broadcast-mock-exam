import { getCurrentUser } from "../../lib/auth.js";
import Breadcrumbs from "../../components/Breadcrumbs.js";
import ContactForm from "./ContactForm.js";

export default async function ContactPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Contact us" }]}
        root={user ? undefined : { label: "Home", href: "/" }}
      />
      <div className="wrap">
        <div className="card narrow">
          <h1>Contact us</h1>
          <p className="muted">Have a question or ran into a problem? Send us a message below.</p>
          <ContactForm defaultEmail={user ? user.email : ""} loggedIn={!!user} />
        </div>
      </div>
    </div>
  );
}
