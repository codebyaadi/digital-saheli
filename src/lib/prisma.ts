import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { p?: PrismaClient };
export const prisma = g.p ?? (g.p = new PrismaClient());
