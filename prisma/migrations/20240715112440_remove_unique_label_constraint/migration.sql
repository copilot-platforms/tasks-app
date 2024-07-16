/*
  Warnings:

  - A unique constraint covering the columns `[label,deletedAt]` on the table `Tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Labels_label_key";

-- DropIndex
DROP INDEX "Tasks_label_key";

-- CreateIndex
CREATE UNIQUE INDEX "Tasks_label_deletedAt_key" ON "Tasks"("label", "deletedAt");
