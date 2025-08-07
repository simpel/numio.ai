/*
  Warnings:

  - Added the required column `actorId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "actorId" TEXT;

-- Update existing events to use the team owner as the actor
UPDATE "Event" 
SET "actorId" = (
    SELECT "ownerId" 
    FROM "Team" 
    WHERE "Team"."id" = (
        SELECT "teamId" 
        FROM "Case" 
        WHERE "Case"."id" = "Event"."caseId"
    )
);

-- Make the column required
ALTER TABLE "Event" ALTER COLUMN "actorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
