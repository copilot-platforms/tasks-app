/*
  Warnings:

  - A unique constraint covering the columns `[clientId,companyId,notificationId,deletedAt]` on the table `ClientNotifications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ClientNotifications_clientId_companyId_notificationId_delet_key" ON "ClientNotifications"("clientId", "companyId", "notificationId", "deletedAt");
