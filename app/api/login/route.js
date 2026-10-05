import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/db.js";
import { getSession } from "../../../lib/session.js";

export async function POST(request) {
  const { email, password } = await request.json();
  const user = await prisma.user.findUnique({
    where: { email: (email || "").trim().toLowerCase() },
  });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  const ok = await bcrypt.compare(password || "", user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const session = await getSession();
  session.userId = user.id;
  session.isAdmin = user.isAdmin;
  await session.save();

  // Every account can reach the dashboard - which papers they can attempt
  // depends on their plan, checked per-exam, not at login.
  return NextResponse.json({ ok: true, redirect: "/dashboard" });
}
