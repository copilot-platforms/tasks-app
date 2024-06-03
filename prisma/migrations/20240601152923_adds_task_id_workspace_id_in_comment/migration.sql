/*
  Warnings:

  - Added the required column `taskId` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "taskId" UUID NOT NULL,
ADD COLUMN     "workspaceId" VARCHAR(32) NOT NULL;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
