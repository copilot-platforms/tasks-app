/*
  Warnings:

  - You are about to drop the column `createdBy` on the `TaskTemplates` table. All the data in the column will be lost.
  - You are about to alter the column `workspaceId` on the `TaskTemplates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(24)`.
  - You are about to alter the column `templateName` on the `TaskTemplates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `title` on the `TaskTemplates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The `assigneeId` column on the `TaskTemplates` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdBy` on the `Tasks` table. All the data in the column will be lost.
  - You are about to alter the column `workspaceId` on the `Tasks` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(24)`.
  - The `assigneeId` column on the `Tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `title` on the `Tasks` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `workspaceId` on the `ViewSettings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(24)`.
  - You are about to alter the column `workspaceId` on the `WorkflowStates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(24)`.
  - You are about to alter the column `name` on the `WorkflowStates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `key` on the `WorkflowStates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `color` on the `WorkflowStates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(9)`.
  - Added the required column `createdById` to the `TaskTemplates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Tasks` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `userId` on the `ViewSettings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "TaskTemplates" DROP CONSTRAINT "TaskTemplates_workflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "Tasks" DROP CONSTRAINT "Tasks_workflowStateId_fkey";

-- AlterTable
ALTER TABLE "TaskTemplates" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" UUID NOT NULL,
ALTER COLUMN "workspaceId" SET DATA TYPE VARCHAR(24),
ALTER COLUMN "templateName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(100),
DROP COLUMN "assigneeId",
ADD COLUMN     "assigneeId" UUID;

-- AlterTable
ALTER TABLE "Tasks" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" UUID NOT NULL,
ALTER COLUMN "workspaceId" SET DATA TYPE VARCHAR(24),
DROP COLUMN "assigneeId",
ADD COLUMN     "assigneeId" UUID,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "ViewSettings" DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ALTER COLUMN "workspaceId" SET DATA TYPE VARCHAR(24);

-- AlterTable
ALTER TABLE "WorkflowStates" ALTER COLUMN "workspaceId" SET DATA TYPE VARCHAR(24),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "key" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "color" SET DATA TYPE VARCHAR(9);

-- CreateIndex
CREATE INDEX "IX_ViewSettings_userId_workspaceId" ON "ViewSettings"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ViewSettings_userId_workspaceId_key" ON "ViewSettings"("userId", "workspaceId");

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowStates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTemplates" ADD CONSTRAINT "TaskTemplates_workflowStateId_fkey" FOREIGN KEY ("workflowStateId") REFERENCES "WorkflowStates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
