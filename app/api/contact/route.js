import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth.js";
import { prisma } from "../../../lib/db.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const user = await getCurrentUser();
  const body = await request.json();
  // Logged-in senders always use their own account email - never trust a
  // different one supplied by the client for an authenticated request.
  const email = user ? user.email : (body.email || "").trim().toLowerCase();
  const message = (body.message || "").trim();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Enter a message." }, { status: 400 });
  }

  await prisma.contactMessage.create({ data: { email, message } });
  return NextResponse.json({ ok: true });
}
