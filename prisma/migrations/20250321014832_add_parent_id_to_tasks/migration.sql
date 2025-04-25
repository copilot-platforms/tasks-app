-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "parentId" UUID;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
