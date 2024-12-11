/*
  Warnings:

  - A unique constraint covering the columns `[title,workspaceId]` on the table `TaskTemplates` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplates_title_workspaceId_key" ON "TaskTemplates"("title", "workspaceId");
