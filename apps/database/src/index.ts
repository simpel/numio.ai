import { PrismaClient } from '@prisma/client';
import { createPrismaClientWithMetrics } from './metrics.js';

// Prevent multiple instances in development (Next.js, etc.)
const globalForPrisma = globalThis as unknown as {
	db?: PrismaClient;
};

export const db = globalForPrisma.db || createPrismaClientWithMetrics();

if (process.env.NODE_ENV !== 'production') globalForPrisma.db = db;

export * from '@prisma/client';
export * from './metrics.js';
