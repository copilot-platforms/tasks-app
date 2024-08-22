-- CreateTable
CREATE TABLE "InternalUserNotifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "internalUserId" UUID NOT NULL,
    "notificationId" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InternalUserNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IX_InternalUserNotifications_notificationId" ON "InternalUserNotifications"("notificationId");

-- CreateIndex
CREATE INDEX "IX_InternalUserNotifications_clientId_taskId_deletedAt" ON "InternalUserNotifications"("internalUserId", "taskId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InternalUserNotifications_notificationId_key" ON "InternalUserNotifications"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "InternalUserNotifications_internalUserId_taskId_deletedAt_key" ON "InternalUserNotifications"("internalUserId", "taskId", "deletedAt");

-- AddForeignKey
ALTER TABLE "InternalUserNotifications" ADD CONSTRAINT "InternalUserNotifications_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
