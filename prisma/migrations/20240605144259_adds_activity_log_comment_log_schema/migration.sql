-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATE_TASK', 'ASSIGN_TASK', 'WORKFLOWSTATE_UPDATE');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('COMMENT', 'ACTIVITY');

-- DropForeignKey
ALTER TABLE "Attachments" DROP CONSTRAINT "Attachments_taskId_fkey";

-- AlterTable
ALTER TABLE "Attachments" ADD COLUMN     "commentId" UUID,
ALTER COLUMN "taskId" DROP NOT NULL;

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

-- CreateTable
CREATE TABLE "ActivityLogs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logId" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "workspaceId" VARCHAR(32) NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "details" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ActivityLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "initiator" TEXT NOT NULL,
    "initiatorId" UUID NOT NULL,
    "parentId" UUID,
    "logId" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "workspaceId" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityLogs_logId_key" ON "ActivityLogs"("logId");

-- CreateIndex
CREATE INDEX "ActivityLogs_createdAt_idx" ON "ActivityLogs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Comments_logId_key" ON "Comments"("logId");

-- AddForeignKey
ALTER TABLE "Attachments" ADD CONSTRAINT "Attachments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachments" ADD CONSTRAINT "Attachments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_logId_fkey" FOREIGN KEY ("logId") REFERENCES "Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
