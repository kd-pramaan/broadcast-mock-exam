import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db.js";
import { getCurrentUser } from "../../../../lib/auth.js";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  if (user.plan !== "basic") {
    return NextResponse.json({ error: "Payment already submitted." }, { status: 400 });
  }
  const { reference } = await request.json();
  await prisma.user.update({
    where: { id: user.id },
    data: { plan: "pending_approval", paymentReference: reference || null },
  });
  return NextResponse.json({ ok: true });
}
