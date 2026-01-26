-- CreateIndex
CREATE INDEX "IX_Comments_taskId_workspaceId_createdAt" ON "Comments"("taskId", "workspaceId", "createdAt" DESC);
