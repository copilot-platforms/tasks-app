-- AlterTable
ALTER TABLE "TaskTemplates" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ViewSettings" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorkflowStates" ADD COLUMN     "deletedAt" TIMESTAMP(3);
