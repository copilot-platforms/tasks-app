-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('TASK_CREATED', 'TASK_ASSIGNED', 'WORKFLOW_STATE_UPDATED');

-- AlterTable
ALTER TABLE "Attachments" ADD COLUMN     "commentId" UUID,
ALTER COLUMN "taskId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ActivityLogs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "taskId" UUID NOT NULL,
    "workspaceId" VARCHAR(32) NOT NULL,
    "type" "ActivityType" NOT NULL,
    "details" JSONB NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ActivityLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "initiator" TEXT NOT NULL,
    "initiatorId" UUID NOT NULL,
    "parentId" UUID,
    "taskId" UUID NOT NULL,
    "workspaceId" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLogs_createdAt_idx" ON "ActivityLogs"("createdAt");

-- CreateIndex
CREATE INDEX "IX_ActivityLogs_taskId" ON "ActivityLogs"("taskId");

-- CreateIndex
CREATE INDEX "IX_ActivityLogs_userId" ON "ActivityLogs"("userId");

-- AddForeignKey
ALTER TABLE "Attachments" ADD CONSTRAINT "Attachments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
