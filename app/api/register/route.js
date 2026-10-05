import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/db.js";
import { getSession } from "../../../lib/session.js";

const REGIONS = ["North", "South", "East", "West"];

export async function POST(request) {
  const body = await request.json();
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const age = Number(body.age);
  const region = body.region;
  const password = body.password || "";
  const confirmPassword = body.confirmPassword || "";

  if (!name || !email || !age || !REGIONS.includes(region)) {
    return NextResponse.json(
      { error: "All fields are required and region must be North, South, East or West." },
      { status: 400 }
    );
  }
  if (age < 14 || age > 100) {
    return NextResponse.json({ error: "Enter a valid age." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords don't match." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    // No email verification step: the account is active immediately, on
    // the free "basic" plan (a small set of exams); paying later upgrades
    // plan to "paid" via the admin-approved flow in /pay.
    data: { name, email, age, region, passwordHash, status: "active", plan: "basic" },
  });

  const session = await getSession();
  session.userId = user.id;
  session.isAdmin = user.isAdmin;
  await session.save();

  return NextResponse.json({ ok: true, redirect: "/dashboard" });
}
