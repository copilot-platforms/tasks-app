-- DropForeignKey
ALTER TABLE "Attachments" DROP CONSTRAINT "Attachments_taskId_fkey";

-- AddForeignKey
ALTER TABLE "Attachments" ADD CONSTRAINT "Attachments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
