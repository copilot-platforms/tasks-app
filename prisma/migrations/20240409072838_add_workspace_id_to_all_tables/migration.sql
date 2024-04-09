/*
  Warnings:

  - Added the required column `workspaceId` to the `StatusSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `ViewSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StatusSettings" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "workspaceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ViewSettings" ADD COLUMN     "workspaceId" TEXT NOT NULL;
