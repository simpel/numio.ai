-- CreateEnum
CREATE TYPE "CaseState" AS ENUM ('created', 'active', 'on_hold', 'closed');

-- CreateEnum
CREATE TYPE "TeamState" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "state" "CaseState" NOT NULL DEFAULT 'created';

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "state" "TeamState" NOT NULL DEFAULT 'active';
