import { cache } from "react";
import { getSession } from "./session.js";
import { prisma } from "./db.js";

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session.userId) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
});
