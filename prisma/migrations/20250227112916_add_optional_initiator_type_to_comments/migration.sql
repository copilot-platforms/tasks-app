-- CreateEnum
CREATE TYPE "CommentInitiator" AS ENUM ('internalUser', 'client');

-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "initiatorType" "CommentInitiator";
