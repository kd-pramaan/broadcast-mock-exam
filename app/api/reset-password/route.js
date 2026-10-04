import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/db.js";

export async function POST(request) {
  const { token, password } = await request.json();
  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { verifyToken: token } });
  if (!user) {
    return NextResponse.json({ error: "Link is invalid or already used." }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  // unlike /api/set-password, this never touches `status` - resetting a
  // password must not demote an active/approved user back in the funnel.
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, verifyToken: null },
  });
  return NextResponse.json({ ok: true });
}
