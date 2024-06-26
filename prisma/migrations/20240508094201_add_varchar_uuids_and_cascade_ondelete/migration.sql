-- AlterTable
ALTER TABLE "TaskTemplates" ALTER COLUMN "workspaceId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "templateName" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Tasks" ALTER COLUMN "workspaceId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "ViewSettings" ALTER COLUMN "workspaceId" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "WorkflowStates" ALTER COLUMN "workspaceId" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "key" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "color" SET DATA TYPE VARCHAR(32);
