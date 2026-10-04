import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "../../../lib/db.js";
import { sendPasswordResetEmail } from "../../../lib/email.js";

export async function POST(request) {
  const { email } = await request.json();
  const normalized = (email || "").trim().toLowerCase();

  // ponytail: same response whether or not the account exists - don't leak
  // which emails are registered.
  if (normalized) {
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (user) {
      const resetToken = crypto.randomBytes(24).toString("hex");
      // reuses the verifyToken column (nullable+unique) that set-password
      // already consumes - same token, same "one link, one use" semantics.
      await prisma.user.update({ where: { id: user.id }, data: { verifyToken: resetToken } });
      const base = process.env.APP_URL || request.nextUrl.origin;
      await sendPasswordResetEmail(normalized, `${base}/reset-password/${resetToken}`);
    }
  }

  return NextResponse.json({ ok: true });
}
