/*
  Warnings:

  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "image";
