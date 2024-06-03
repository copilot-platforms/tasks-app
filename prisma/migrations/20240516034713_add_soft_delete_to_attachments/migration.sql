/*
  Warnings:

  - A unique constraint covering the columns `[filePath]` on the table `Attachments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fileName]` on the table `Attachments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Attachments" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "IX_Attachments_filePath" ON "Attachments"("filePath");

-- CreateIndex
CREATE INDEX "IX_Attachments_fileName" ON "Attachments"("fileName");

-- CreateIndex
CREATE UNIQUE INDEX "Attachments_filePath_key" ON "Attachments"("filePath");

-- CreateIndex
CREATE UNIQUE INDEX "Attachments_fileName_key" ON "Attachments"("fileName");
