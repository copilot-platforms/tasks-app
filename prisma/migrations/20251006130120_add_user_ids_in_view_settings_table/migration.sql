/*
  Warnings:

  - You are about to drop the column `userId` on the `ViewSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[internalUserId,clientId,companyId,workspaceId]` on the table `ViewSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "IX_ViewSettings_userId_workspaceId";

-- DropIndex
DROP INDEX "ViewSettings_userId_workspaceId_key";

-- AlterTable
ALTER TABLE "ViewSettings" DROP COLUMN "userId",
ADD COLUMN     "clientId" UUID,
ADD COLUMN     "companyId" UUID,
ADD COLUMN     "internalUserId" UUID;

-- CreateIndex
CREATE INDEX "IX_ViewSettings_iuId_workspaceId" ON "ViewSettings"("internalUserId", "workspaceId");

-- CreateIndex
CREATE INDEX "IX_ViewSettings_cuId_companyId_workspaceId" ON "ViewSettings"("clientId", "companyId", "workspaceId");

-- CreateIndex
CREATE INDEX "IX_ViewSettings_userIds_workspaceId" ON "ViewSettings"("internalUserId", "clientId", "companyId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ViewSettings_internalUserId_clientId_companyId_workspaceId_key" ON "ViewSettings"("internalUserId", "clientId", "companyId", "workspaceId");
