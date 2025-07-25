/*
  Warnings:

  - A unique constraint covering the columns `[taskId,clientId,companyId,deletedAt]` on the table `ClientNotifications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ClientNotifications_taskId_clientId_companyId_deletedAt_key" ON "ClientNotifications"("taskId", "clientId", "companyId", "deletedAt");
