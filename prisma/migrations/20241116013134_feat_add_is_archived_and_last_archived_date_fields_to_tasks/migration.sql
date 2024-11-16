-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastArchivedDate" TIMESTAMP(3);
