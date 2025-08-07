import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development (Next.js, etc.)
const globalForPrisma = globalThis as unknown as { db?: PrismaClient };

export const db = globalForPrisma.db || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.db = db;

export * from '@prisma/client';
