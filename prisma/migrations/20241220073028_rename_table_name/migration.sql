-- AlterTable
ALTER TABLE "ScrapMedias" RENAME CONSTRAINT "ScrapImages_pkey" TO "ScrapMedias_pkey";

-- RenameForeignKey
ALTER TABLE "ScrapMedias" RENAME CONSTRAINT "ScrapImages_taskId_fkey" TO "ScrapMedias_taskId_fkey";

-- RenameForeignKey
ALTER TABLE "ScrapMedias" RENAME CONSTRAINT "ScrapImages_templateId_fkey" TO "ScrapMedias_templateId_fkey";

-- RenameIndex
ALTER INDEX "ScrapImages_createdAt_idx" RENAME TO "ScrapMedias_createdAt_idx";

-- RenameIndex
ALTER INDEX "ScrapImages_filePath_idx" RENAME TO "ScrapMedias_filePath_idx";

-- RenameIndex
ALTER INDEX "ScrapImages_filePath_key" RENAME TO "ScrapMedias_filePath_key";
