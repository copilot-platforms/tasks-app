-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('backlog', 'unstarted', 'started', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ViewMode" AS ENUM ('board', 'list');

-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('person', 'team', 'client', 'all');

-- CreateEnum
CREATE TYPE "AssigneeType" AS ENUM ('iu', 'client', 'company');

-- CreateTable
CREATE TABLE "StatusSettings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "StatusType" NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "StatusSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assigneeId" TEXT,
    "assigneeType" "AssigneeType",
    "title" TEXT NOT NULL,
    "body" TEXT,
    "statusSettingId" UUID NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewSettings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "viewMode" "ViewMode",
    "filterType" "FilterType",
    "hiddenStatuses" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "ViewSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "key" ON "StatusSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ViewSettings_userId_key" ON "ViewSettings"("userId");

-- CreateIndex
CREATE INDEX "userId" ON "ViewSettings"("userId");

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_statusSettingId_fkey" FOREIGN KEY ("statusSettingId") REFERENCES "StatusSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
