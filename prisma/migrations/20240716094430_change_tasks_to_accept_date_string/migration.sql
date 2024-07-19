/*
  Warnings:

  - The `dueDate` column on the `Tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Tasks" DROP COLUMN "dueDate",
ADD COLUMN     "dueDate" VARCHAR(10);
