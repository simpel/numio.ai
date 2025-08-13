/*
  Warnings:

  - You are about to drop the column `targetCaseId` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `targetClientId` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `targetOrganisationId` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `targetTeamId` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `Membership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[memberUserProfileId,memberTeamId,organisationId,teamId,caseId,clientId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_targetCaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_targetClientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_targetOrganisationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_targetTeamId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_userProfileId_fkey";

-- DropIndex
DROP INDEX "public"."Membership_userProfileId_teamId_targetOrganisationId_target_key";

-- AlterTable
ALTER TABLE "public"."Membership" DROP COLUMN "targetCaseId",
DROP COLUMN "targetClientId",
DROP COLUMN "targetOrganisationId",
DROP COLUMN "targetTeamId",
DROP COLUMN "userProfileId",
ADD COLUMN     "caseId" TEXT,
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "memberTeamId" TEXT,
ADD COLUMN     "memberUserProfileId" TEXT,
ADD COLUMN     "organisationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Membership_memberUserProfileId_memberTeamId_organisationId__key" ON "public"."Membership"("memberUserProfileId", "memberTeamId", "organisationId", "teamId", "caseId", "clientId");

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_memberUserProfileId_fkey" FOREIGN KEY ("memberUserProfileId") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_memberTeamId_fkey" FOREIGN KEY ("memberTeamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "public"."Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "public"."Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
