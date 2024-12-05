-- AlterTable
ALTER TABLE "ScrapImages" ADD COLUMN     "templateId" UUID;

-- AddForeignKey
ALTER TABLE "ScrapImages" ADD CONSTRAINT "ScrapImages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "TaskTemplates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
