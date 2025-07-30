-- Prevent InternalUser tasks from having clientId or companyId
ALTER TABLE "Tasks"
ADD CONSTRAINT task_internal_user_exclusive
CHECK (
    ("internalUserId" IS NULL) OR
    ("clientId" IS NULL AND "companyId" IS NULL)
);

-- Ensure if clientId is set, companyId must also be set
ALTER TABLE "Tasks"
ADD CONSTRAINT task_client_requires_company
CHECK (
    "clientId" IS NULL OR "companyId" IS NOT NULL
);
