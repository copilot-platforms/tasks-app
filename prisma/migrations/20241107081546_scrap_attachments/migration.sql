/*
  Warnings:

  - You are about to drop the `ScrapImages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ScrapImages" DROP CONSTRAINT "ScrapImages_taskId_fkey";

-- DropTable
DROP TABLE "ScrapImages";

-- CreateTable
CREATE TABLE "ScrapAttachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "filePath" TEXT NOT NULL,
    "taskId" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,
    "workspaceId" VARCHAR(32) NOT NULL,

    CONSTRAINT "ScrapAttachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapAttachments_filePath_key" ON "ScrapAttachments"("filePath");

-- CreateIndex
CREATE INDEX "ScrapAttachments_createdAt_idx" ON "ScrapAttachments"("createdAt");

-- CreateIndex
CREATE INDEX "ScrapAttachments_filePath_idx" ON "ScrapAttachments"("filePath");

-- AddForeignKey
ALTER TABLE "ScrapAttachments" ADD CONSTRAINT "ScrapAttachments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
