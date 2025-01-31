import DBClient from '@/lib/db'

/**
 * Cmd script to delete duplicate notifications for clients by preserving only the latest one
 */
const run = async () => {
  const db = DBClient.getInstance()
  const duplicates: { taskId: string; clientId: string; latestCreatedAt: number }[] = await db.$queryRaw`
    SELECT "taskId", "clientId", max("createdAt") AS "latestCreatedAt"
    FROM (SELECT "taskId", "clientId", "createdAt"
          FROM "ClientNotifications"
          WHERE "deletedAt" IS NULL) c
    GROUP BY "taskId", "clientId"
    HAVING count(*) > 1
  `
  const duplicatesToDelete = await db.clientNotification.findMany({
    where: {
      OR: duplicates.map(({ taskId, clientId, latestCreatedAt }) => ({
        taskId,
        clientId,
        not: { createdAt: latestCreatedAt },
      })),
    },
  })
  await db.clientNotification.deleteMany({
    where: { id: { in: duplicatesToDelete.map((notification) => notification.id) } },
  })
}

run()
