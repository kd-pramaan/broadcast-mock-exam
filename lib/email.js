import { Resend } from "resend";

// skipped: queue/retry infra - send inline, fine at this volume.
// No RESEND_API_KEY -> log the link instead of sending, so local dev and
// testing never need a real email account.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function sendVerificationEmail(to, link) {
  if (!resend) {
    console.log(`[email stub] verify ${to}: ${link}`);
    return;
  }
  await resend.emails.send({
    from,
    to,
    subject: "Verify your email - Broadcast Mock Exam",
    html: `<p>Click the link below to verify your email and set your password:</p><p><a href="${link}">${link}</a></p>`,
  });
}

export async function sendPasswordResetEmail(to, link) {
  if (!resend) {
    console.log(`[email stub] reset ${to}: ${link}`);
    return;
  }
  await resend.emails.send({
    from,
    to,
    subject: "Reset your password - Broadcast Mock Exam",
    html: `<p>Click the link below to set a new password. If you didn't request this, ignore this email.</p><p><a href="${link}">${link}</a></p>`,
  });
}

export async function sendActivationEmail(to) {
  if (!resend) {
    console.log(`[email stub] activated ${to}`);
    return;
  }
  await resend.emails.send({
    from,
    to,
    subject: "Your account is active - Broadcast Mock Exam",
    html: `<p>Your payment has been verified. Log in to start your mock exams.</p>`,
  });
}
