/*
  Warnings:

  - You are about to drop the column `userType` on the `ActivityLogs` table. All the data in the column will be lost.
  - Added the required column `userRole` to the `ActivityLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityLogs" DROP COLUMN "userType",
ADD COLUMN     "userRole" "AssigneeType" NOT NULL;
