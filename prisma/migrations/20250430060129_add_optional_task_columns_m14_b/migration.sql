-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "archivedBy" UUID,
ADD COLUMN     "completedBy" UUID,
ADD COLUMN     "completedByUserType" "AssigneeType",
ADD COLUMN     "deletedBy" UUID,
ADD COLUMN     "templateId" UUID;
