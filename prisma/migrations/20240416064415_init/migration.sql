-- CreateEnum
CREATE TYPE "StateType" AS ENUM ('backlog', 'unstarted', 'started', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "AssigneeType" AS ENUM ('iu', 'client', 'company');

-- CreateTable
CREATE TABLE "WorkflowStates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" TEXT NOT NULL,
    "type" "StateType" NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "WorkflowStates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "assigneeType" "AssigneeType",
    "title" TEXT NOT NULL,
    "body" TEXT,
    "createdBy" TEXT NOT NULL,
    "workflowStateId" UUID NOT NULL,

    CONSTRAINT "Tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IX_WorkflowStates_workspaceId_key" ON "WorkflowStates"("workspaceId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStates_workspaceId_key_key" ON "WorkflowStates"("workspaceId", "key");

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowStates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
