import { PrismaClient } from "@prisma/client";

// ponytail: one global instance so dev hot-reload doesn't open a new DB
// connection pool on every edit. Standard Next.js + Prisma pattern.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
