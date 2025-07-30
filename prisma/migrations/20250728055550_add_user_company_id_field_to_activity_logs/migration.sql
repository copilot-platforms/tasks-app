-- AlterTable
ALTER TABLE "ActivityLogs" ADD COLUMN     "userCompanyId" UUID;

-- CreateIndex
CREATE INDEX "IX_ActivityLogs_userId_userCompanyId" ON "ActivityLogs"("userId", "userCompanyId");
