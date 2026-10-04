import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../../lib/auth.js";
import Nav from "../../../../components/Nav.js";
import NewExamForm from "./NewExamForm.js";

export default async function NewExamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/dashboard");

  return (
    <div>
      <Nav isAdmin={user.isAdmin} />
      <div className="wrap">
        <div className="card">
          <h1>Create exam</h1>
          <p className="muted">
            Upload a JSON file with the questions, then fill in the exam details below.
          </p>
          <p className="muted">
            Expected format: an array of questions, each with <code>id</code>, <code>text</code>,{" "}
            <code>options</code> (2+ choices), <code>correctIndex</code> and <code>marks</code>. Example:
          </p>
          <pre className="code-block">{`[
  {
    "id": "q1",
    "text": "Which frequency range is used for FM radio?",
    "options": ["3-30 kHz", "88-108 MHz", "300-3000 MHz", "1-2 GHz"],
    "correctIndex": 1,
    "marks": 2
  }
]`}</pre>
        </div>
        <NewExamForm />
      </div>
    </div>
  );
}
