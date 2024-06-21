/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `Tasks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `label` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "label" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Labels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "label" TEXT NOT NULL,
    "labelledEntity" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Labels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Labels_label_key" ON "Labels"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Tasks_label_key" ON "Tasks"("label");
