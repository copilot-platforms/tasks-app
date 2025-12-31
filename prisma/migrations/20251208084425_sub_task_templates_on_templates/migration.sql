-- AlterTable
ALTER TABLE "TaskTemplates" ADD COLUMN     "parentId" UUID;

-- AddForeignKey
ALTER TABLE "TaskTemplates" ADD CONSTRAINT "TaskTemplates_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TaskTemplates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
