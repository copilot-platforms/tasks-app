-- CreateEnum
CREATE TYPE "Source" AS ENUM ('web', 'api');

-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "source" "Source" NOT NULL DEFAULT 'web';
