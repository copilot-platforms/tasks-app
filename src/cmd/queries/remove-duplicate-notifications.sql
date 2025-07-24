DELETE FROM "ClientNotifications" AS cn
    WHERE cn."deletedAt" IS NULL
    AND EXISTS (
        SELECT 1
        FROM "ClientNotifications" AS sub
        WHERE sub."taskId" = cn."taskId"
            AND sub."clientId" = cn."clientId"
            AND sub."deletedAt" IS NULL
        GROUP BY sub."taskId", sub."clientId"
        HAVING COUNT(sub.id) > 1
    );
