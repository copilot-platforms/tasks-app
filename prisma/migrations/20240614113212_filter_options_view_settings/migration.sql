/*
  Warnings:

  - Added the required column `filterOptions` to the `ViewSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ViewSettings" ADD COLUMN     "filterOptions" JSONB NOT NULL;
