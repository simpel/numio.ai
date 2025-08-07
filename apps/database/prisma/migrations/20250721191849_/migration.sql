/*
  Warnings:

  - You are about to drop the column `userId` on the `Membership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userProfileId,teamId,organisationId,teamContextId,caseId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropIndex
DROP INDEX "Membership_userId_teamId_organisationId_teamContextId_caseI_key";

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "userId",
ADD COLUMN     "userProfileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userProfileId_teamId_organisationId_teamContextI_key" ON "Membership"("userProfileId", "teamId", "organisationId", "teamContextId", "caseId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
