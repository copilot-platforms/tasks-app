/*
  Warnings:

  - Added the required column `userRole` to the `ActivityLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityLogs" ADD COLUMN     "userRole" "AssigneeType" NOT NULL;
