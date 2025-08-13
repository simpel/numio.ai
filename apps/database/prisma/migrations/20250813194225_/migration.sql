/*
  Warnings:

  - The values [admin,client] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ownerId` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Team` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('authenticated', 'owner', 'member', 'assignee', 'superadmin');
ALTER TABLE "public"."user_profiles" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."user_profiles" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TABLE "public"."Membership" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TABLE "public"."Invite" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."user_profiles" ALTER COLUMN "role" SET DEFAULT 'authenticated';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Organisation" DROP CONSTRAINT "Organisation_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Team" DROP CONSTRAINT "Team_ownerId_fkey";

-- AlterTable
ALTER TABLE "public"."Organisation" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "public"."Team" DROP COLUMN "ownerId";
