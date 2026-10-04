import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db.js";
import { getCurrentUser } from "../../../../../lib/auth.js";
import { sendActivationEmail } from "../../../../../lib/email.js";

export async function POST(request, { params }) {
  const admin = await getCurrentUser();
  if (!admin || !admin.isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { userId } = await params;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: "active" },
  });
  await sendActivationEmail(user.email);
  return NextResponse.json({ ok: true });
}
