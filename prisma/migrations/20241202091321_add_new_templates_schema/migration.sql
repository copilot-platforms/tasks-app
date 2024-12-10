/*
  Warnings:

  - You are about to drop the column `templateName` on the `TaskTemplates` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `TaskTemplates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workflowStateId` to the `TaskTemplates` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "IX_TaskTemplates_workspaceId_templateName";

-- DropIndex
DROP INDEX "TaskTemplates_workspaceId_templateName_key";

-- AlterTable
ALTER TABLE "TaskTemplates" DROP COLUMN "templateName",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workflowStateId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "TaskTemplates" ADD CONSTRAINT "TaskTemplates_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowStates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
