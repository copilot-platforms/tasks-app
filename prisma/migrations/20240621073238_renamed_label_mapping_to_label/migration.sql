/*
  Warnings:

  - You are about to drop the `LabelMappings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LabelMappings";

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
