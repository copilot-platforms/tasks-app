import DBClient from '@/lib/db'

/**
 * Cmd script to backfill `archivedBy` field for non-deleted, archived tasks
 */
const run = async () => {
  const db = DBClient.getInstance()
  await db.$executeRaw`
    -- Get latest activity logs for ARCHIVE_STATE_UPDATED where value of activity details was switched from false -> true
    WITH LatestArchivalLogs AS (
      SELECT *
      FROM (
        SELECT *,
              ROW_NUMBER() OVER (PARTITION BY "taskId" ORDER BY "createdAt" DESC) AS rn
        FROM "ActivityLogs"
        WHERE type = 'ARCHIVE_STATE_UPDATED'
          AND details ->> 'newValue' = 'true'
          AND "taskId" IN (
            SELECT id
            FROM "Tasks"
            WHERE "isArchived" IS true
              AND "deletedAt" IS NULL
          )
      ) l
      WHERE rn = 1
    )

    -- Update all archived tasks to save activity log's userId to "archivedBy" column
    UPDATE "Tasks" t
    SET "archivedBy" = l."userId"
    FROM LatestArchivalLogs l
    WHERE t.id = l."taskId"
  `
}

run()
