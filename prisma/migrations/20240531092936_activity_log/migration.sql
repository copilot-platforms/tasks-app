-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATE_TASK', 'ASSIGN_TASK', 'WORKFLOWSTATE_UPDATE');

-- CreateTable
CREATE TABLE "ActivityLogs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" UUID NOT NULL,
    "workspaceId" VARCHAR(32) NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "details" JSONB NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ActivityLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLogs_createdAt_idx" ON "ActivityLogs"("createdAt");

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
