/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ActivityLogs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ActivityLogs_createdAt_idx";

-- DropIndex
DROP INDEX "IX_ActivityLogs_userId";

-- AlterTable
ALTER TABLE "ActivityLogs" DROP COLUMN "updatedAt",
ADD COLUMN     "deletedAt" TIMESTAMP(3);
