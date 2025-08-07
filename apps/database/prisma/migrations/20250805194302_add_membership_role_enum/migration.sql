/*
  Warnings:

  - Changed the type of `role` on the `Membership` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('owner', 'admin', 'member', 'assignee');

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "role",
ADD COLUMN     "role" "MembershipRole" NOT NULL;
