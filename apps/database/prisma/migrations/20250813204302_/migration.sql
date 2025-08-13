/*
  Warnings:

  - You are about to drop the column `caseId` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `organisationId` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `teamContextId` on the `Membership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userProfileId,teamId,targetOrganisationId,targetTeamId,targetCaseId,targetClientId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_caseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Membership" DROP CONSTRAINT "Membership_teamContextId_fkey";

-- DropIndex
DROP INDEX "public"."Membership_userProfileId_teamId_organisationId_teamContextI_key";

-- AlterTable
ALTER TABLE "public"."Membership" DROP COLUMN "caseId",
DROP COLUMN "clientId",
DROP COLUMN "organisationId",
DROP COLUMN "teamContextId",
ADD COLUMN     "targetCaseId" TEXT,
ADD COLUMN     "targetClientId" TEXT,
ADD COLUMN     "targetOrganisationId" TEXT,
ADD COLUMN     "targetTeamId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userProfileId_teamId_targetOrganisationId_target_key" ON "public"."Membership"("userProfileId", "teamId", "targetOrganisationId", "targetTeamId", "targetCaseId", "targetClientId");

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_targetOrganisationId_fkey" FOREIGN KEY ("targetOrganisationId") REFERENCES "public"."Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_targetTeamId_fkey" FOREIGN KEY ("targetTeamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_targetCaseId_fkey" FOREIGN KEY ("targetCaseId") REFERENCES "public"."Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_targetClientId_fkey" FOREIGN KEY ("targetClientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
