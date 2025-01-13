/*
  Warnings:

  - A unique constraint covering the columns `[title,workspaceId,deletedAt]` on the table `TaskTemplates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TaskTemplates_title_workspaceId_key";

-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplates_title_workspaceId_deletedAt_key" ON "TaskTemplates"("title", "workspaceId", "deletedAt");
