-- AlterTable
ALTER TABLE "ViewSettings" ADD COLUMN     "showArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showUnarchived" BOOLEAN NOT NULL DEFAULT true;
