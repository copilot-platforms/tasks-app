/*
  Warnings:

  - You are about to drop the `attachments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_taskId_fkey";

-- DropTable
DROP TABLE "attachments";
