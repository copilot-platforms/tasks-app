-- CreateIndex
CREATE INDEX "TaskTemplates_workspaceId_parentId_createdAt_idx" ON "TaskTemplates"("workspaceId", "parentId", "createdAt" DESC);
