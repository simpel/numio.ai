/*
  Warnings:

  - You are about to drop the column `chatSettingIsPublic` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `chatSettingSearchMode` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `messageCount` on the `user_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "chatSettingIsPublic",
DROP COLUMN "chatSettingSearchMode",
DROP COLUMN "image",
DROP COLUMN "messageCount";
