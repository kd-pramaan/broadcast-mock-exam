import { getSession } from "./session.js";
import { prisma } from "./db.js";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}
