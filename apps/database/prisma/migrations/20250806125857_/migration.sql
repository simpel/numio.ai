/*
  Warnings:

  - You are about to drop the `TeamClient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userProfileId,teamId,organisationId,teamContextId,caseId,clientId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'client';

-- DropForeignKey
ALTER TABLE "TeamClient" DROP CONSTRAINT "TeamClient_clientId_fkey";

-- DropForeignKey
ALTER TABLE "TeamClient" DROP CONSTRAINT "TeamClient_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- DropIndex
DROP INDEX "Membership_userProfileId_teamId_organisationId_teamContextI_key";

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "clientId" TEXT;

-- DropTable
DROP TABLE "TeamClient";

-- DropTable
DROP TABLE "TeamMember";

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userProfileId_teamId_organisationId_teamContextI_key" ON "Membership"("userProfileId", "teamId", "organisationId", "teamContextId", "caseId", "clientId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
