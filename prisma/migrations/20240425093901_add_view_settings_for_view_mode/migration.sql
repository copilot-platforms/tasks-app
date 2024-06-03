-- CreateEnum
CREATE TYPE "ViewMode" AS ENUM ('board', 'list');

-- CreateTable
CREATE TABLE "ViewSettings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "viewMode" "ViewMode" NOT NULL DEFAULT 'board',
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "ViewSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IX_ViewSettings_userId_workspaceId" ON "ViewSettings"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ViewSettings_userId_workspaceId_key" ON "ViewSettings"("userId", "workspaceId");
