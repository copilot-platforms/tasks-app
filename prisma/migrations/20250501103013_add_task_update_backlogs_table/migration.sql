-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('waiting', 'processing');

-- CreateTable
CREATE TABLE "TaskUpdateBacklogs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "taskId" UUID NOT NULL,
    "status" "LogStatus" NOT NULL DEFAULT 'waiting',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "TaskUpdateBacklogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskUpdateBacklogs" ADD CONSTRAINT "TaskUpdateBacklogs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
