/*
  Warnings:

  - Added the required column `updatedAt` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Organisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Team` table without a default value. This is not possible if the table is not empty.

*/

-- Add updatedAt columns with default values for existing data
ALTER TABLE "Case" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "Client" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "Organisation" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
ALTER TABLE "Team" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- Remove default constraints to match the schema
ALTER TABLE "Case" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Client" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Organisation" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Team" ALTER COLUMN "updatedAt" DROP DEFAULT;
