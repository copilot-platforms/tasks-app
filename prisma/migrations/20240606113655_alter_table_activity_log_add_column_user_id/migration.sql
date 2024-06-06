/*
  Warnings:

  - Added the required column `userId` to the `ActivityLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityLogs" ADD COLUMN     "userId" UUID NOT NULL;
