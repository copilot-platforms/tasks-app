-- CreateTable
CREATE TABLE "TaskTemplates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "assigneeId" TEXT,
    "assigneeType" "AssigneeType",
    "workflowStateId" UUID NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "TaskTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplates_workspaceId_templateName_key" ON "TaskTemplates"("workspaceId", "templateName");

-- AddForeignKey
ALTER TABLE "TaskTemplates" ADD CONSTRAINT "TaskTemplates_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowStates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
