UPDATE "Tasks"
SET path = id::text::ltree
WHERE "parentId" IS NULL and path IS NULL;
