/*
  Warnings:

  - Added the required column `workspaceId` to the `Attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attachments" ADD COLUMN     "workspaceId" VARCHAR(32) NOT NULL;
