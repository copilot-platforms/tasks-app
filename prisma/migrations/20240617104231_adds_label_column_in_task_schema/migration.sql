/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `Tasks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `label` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "label" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tasks_label_key" ON "Tasks"("label");
