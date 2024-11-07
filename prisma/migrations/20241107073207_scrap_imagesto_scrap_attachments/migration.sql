/*
  Warnings:

  - Added the required column `workspaceId` to the `ScrapImages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScrapImages" ADD COLUMN     "workspaceId" VARCHAR(32) NOT NULL;
