-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "viewers" UUID[] DEFAULT ARRAY[]::UUID[];
