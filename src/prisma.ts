import { PrismaClient } from "./generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let temp;

if(!globalForPrisma.prisma) {
    temp = new PrismaClient;
}
else {
    temp = globalForPrisma.prisma;
}

export const prisma = temp;

// https://authjs.dev/getting-started/adapters/prisma#configuration