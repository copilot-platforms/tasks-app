-- Gets  notification count if duplicate notifications
-- have been created for same task & client
SELECT
    "taskId",
    "clientId",
    count(*) AS "totalCount",
    max("createdAt") AS "latestCreatedAt"
FROM (
    SELECT
        "taskId",
        "clientId",
        "createdAt"
    FROM "ClientNotifications"
    WHERE "deletedAt" IS NULL
)
GROUP BY "taskId", "clientId"
HAVING count(*) > 1;
