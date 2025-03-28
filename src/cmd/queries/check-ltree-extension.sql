-- Query example to check whether or not `ltree` extension is installed 
-- for postgres.
-- We will see "ltree" listed in the query result if the extension is installed
SELECT extname
FROM pg_extension
WHERE extname = 'ltree';
