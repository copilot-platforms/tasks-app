-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATE_TASK', 'ASSIGN_TASK', 'WORKFLOWSTATE_UPDATE');

-- CreateTable
CREATE TABLE "ActivityLogs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" UUID NOT NULL,
    "workspaceId" VARCHAR(32) NOT NULL,
    "activityType" "ActivityType" NOT NULL,

    CONSTRAINT "ActivityLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreateTaskTracker" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activityLogId" UUID NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdById" UUID NOT NULL,

    CONSTRAINT "CreateTaskTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignTracker" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activityLogId" UUID NOT NULL,
    "initiator" TEXT NOT NULL,
    "initiatorId" UUID NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedToId" UUID NOT NULL,

    CONSTRAINT "AssignTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStateTracker" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activityLogId" UUID NOT NULL,
    "initiator" TEXT NOT NULL,
    "initiatorId" UUID NOT NULL,
    "prevWorkflowStateId" UUID NOT NULL,
    "currentWorkflowStateId" UUID NOT NULL,

    CONSTRAINT "WorkflowStateTracker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLogs_createdAt_idx" ON "ActivityLogs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreateTaskTracker_activityLogId_key" ON "CreateTaskTracker"("activityLogId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignTracker_activityLogId_key" ON "AssignTracker"("activityLogId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStateTracker_activityLogId_key" ON "WorkflowStateTracker"("activityLogId");

-- AddForeignKey
ALTER TABLE "ActivityLogs" ADD CONSTRAINT "ActivityLogs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreateTaskTracker" ADD CONSTRAINT "CreateTaskTracker_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "ActivityLogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignTracker" ADD CONSTRAINT "AssignTracker_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "ActivityLogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStateTracker" ADD CONSTRAINT "WorkflowStateTracker_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "ActivityLogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStateTracker" ADD CONSTRAINT "WorkflowStateTracker_prevWorkflowStateId_fkey" FOREIGN KEY ("prevWorkflowStateId") REFERENCES "WorkflowStates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStateTracker" ADD CONSTRAINT "WorkflowStateTracker_currentWorkflowStateId_fkey" FOREIGN KEY ("currentWorkflowStateId") REFERENCES "WorkflowStates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
