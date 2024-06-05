/*
  Warnings:

  - You are about to drop the column `type` on the `ActivityLogs` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Comments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[logId]` on the table `ActivityLogs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[logId]` on the table `Comments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `logId` to the `ActivityLogs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logId` to the `Comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityLogs" DROP COLUMN "type",
ADD COLUMN     "logId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Comments" DROP COLUMN "type",
ADD COLUMN     "logId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "logType" "LogType" NOT NULL,
    "taskId" UUID NOT NULL,
    "workspaceId" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityLogs_logId_key" ON "ActivityLogs"("logId");

-- CreateIndex
CREATE UNIQUE INDEX "Comments_logId_key" ON "Comments"("logId");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;
