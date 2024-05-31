/*
  Warnings:

  - You are about to drop the `AssignTracker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreateTaskTracker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowStateTracker` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `details` to the `ActivityLogs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AssignTracker" DROP CONSTRAINT "AssignTracker_activityLogId_fkey";

-- DropForeignKey
ALTER TABLE "CreateTaskTracker" DROP CONSTRAINT "CreateTaskTracker_activityLogId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowStateTracker" DROP CONSTRAINT "WorkflowStateTracker_activityLogId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowStateTracker" DROP CONSTRAINT "WorkflowStateTracker_currentWorkflowStateId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowStateTracker" DROP CONSTRAINT "WorkflowStateTracker_prevWorkflowStateId_fkey";

-- AlterTable
ALTER TABLE "ActivityLogs" ADD COLUMN     "details" JSONB NOT NULL;

-- DropTable
DROP TABLE "AssignTracker";

-- DropTable
DROP TABLE "CreateTaskTracker";

-- DropTable
DROP TABLE "WorkflowStateTracker";
