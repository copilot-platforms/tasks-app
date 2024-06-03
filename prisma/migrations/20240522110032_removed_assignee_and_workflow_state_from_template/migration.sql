/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `TaskTemplates` table. All the data in the column will be lost.
  - You are about to drop the column `assigneeType` on the `TaskTemplates` table. All the data in the column will be lost.
  - You are about to drop the column `workflowStateId` on the `TaskTemplates` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskTemplates" DROP CONSTRAINT "TaskTemplates_workflowStateId_fkey";

-- AlterTable
ALTER TABLE "TaskTemplates" DROP COLUMN "assigneeId",
DROP COLUMN "assigneeType",
DROP COLUMN "workflowStateId";
