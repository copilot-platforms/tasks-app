-- CreateTable
CREATE TABLE "ClientNotifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL,
    "notificationId" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IX_ClientNotifications_notificationId" ON "ClientNotifications"("notificationId");

-- CreateIndex
CREATE INDEX "IX_ClientNotifications_clientId_taskId_deletedAt" ON "ClientNotifications"("clientId", "taskId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientNotifications_notificationId_key" ON "ClientNotifications"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientNotifications_clientId_taskId_deletedAt_key" ON "ClientNotifications"("clientId", "taskId", "deletedAt");

-- AddForeignKey
ALTER TABLE "ClientNotifications" ADD CONSTRAINT "ClientNotifications_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
