/*
  Warnings:

  - You are about to drop the column `logId` on the `ActivityLogs` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `Comments` table. All the data in the column will be lost.
  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActivityLogs" DROP CONSTRAINT "ActivityLogs_logId_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_logId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_taskId_fkey";

-- DropIndex
DROP INDEX "ActivityLogs_logId_key";

-- DropIndex
DROP INDEX "Comments_logId_key";

-- AlterTable
ALTER TABLE "ActivityLogs" DROP COLUMN "logId";

-- AlterTable
ALTER TABLE "Comments" DROP COLUMN "logId";

-- DropTable
DROP TABLE "Log";
