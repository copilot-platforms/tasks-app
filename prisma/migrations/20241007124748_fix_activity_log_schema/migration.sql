/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ActivityLogs` table. All the data in the column will be lost.
  - You are about to drop the column `userRole` on the `ActivityLogs` table. All the data in the column will be lost.
  - Added the required column `userType` to the `ActivityLogs` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ActivityLogs_createdAt_idx";

-- DropIndex
DROP INDEX "IX_ActivityLogs_userId";

-- AlterTable
ALTER TABLE "ActivityLogs" DROP COLUMN "updatedAt",
DROP COLUMN "userRole",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "userType" "AssigneeType" NOT NULL;
