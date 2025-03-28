-- Seeds and backfills the path column for all tasks created before column was added
UPDATE "Tasks"
SET path = replace(lower(id::text), '-', '_')::ltree
WHERE "parentId" IS NULL AND path IS NULL;

