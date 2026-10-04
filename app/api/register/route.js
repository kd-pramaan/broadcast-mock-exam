import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "../../../lib/db.js";
import { sendVerificationEmail } from "../../../lib/email.js";

const REGIONS = ["North", "South", "East", "West"];

export async function POST(request) {
  const body = await request.json();
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const age = Number(body.age);
  const region = body.region;

  if (!name || !email || !age || !REGIONS.includes(region)) {
    return NextResponse.json(
      { error: "All fields are required and region must be North, South, East or West." },
      { status: 400 }
    );
  }
  if (age < 14 || age > 100) {
    return NextResponse.json({ error: "Enter a valid age." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const verifyToken = crypto.randomBytes(24).toString("hex");
  await prisma.user.create({
    data: { name, email, age, region, verifyToken, status: "pending_verification" },
  });

  const base = process.env.APP_URL || request.nextUrl.origin;
  await sendVerificationEmail(email, `${base}/verify/${verifyToken}`);

  return NextResponse.json({ ok: true });
}
