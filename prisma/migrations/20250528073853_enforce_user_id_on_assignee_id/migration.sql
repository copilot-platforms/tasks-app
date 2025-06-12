-- Migration to enforce mapping of assigneeId to userId
-- If we're removing assigneeId, in the future, remove these constrainst 
-- Cases:
-- If assigneeId is null, do nothing 
-- If assigneeType is internalUser, enforce assigneeId + internalUserId
-- If assigneeType is client, enforce assigneeId + clientId + companyId
-- If assigneeType is company, enforce assigneeId + companyId

ALTER TABLE "Tasks"
ADD CONSTRAINT assignee_to_user_id_mapping CHECK (
    (
        "assigneeId" IS NULL
    ) OR (
        "assigneeType" = 'internalUser'
        AND "assigneeId" IS NOT NULL
        AND "internalUserId" IS NOT NULL
        AND "clientId" IS NULL
        AND "companyId" IS NULL
    ) OR (
        "assigneeType" = 'client'
        AND "assigneeId" IS NOT NULL
        AND "internalUserId" IS NULL
        AND "clientId" IS NOT NULL
        AND "companyId" IS NOT NULL
    ) OR (
        "assigneeType" = 'company'
        AND "assigneeId" IS NOT NULL
        AND "internalUserId" IS NULL
        AND "clientId" IS NULL
        AND "companyId" IS NOT NULL
    )
);
