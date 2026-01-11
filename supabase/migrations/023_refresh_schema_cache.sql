-- Force PostgREST to reload the schema cache.
-- This is necessary after renaming columns (breaking changes) so the API knows about the new column names.
NOTIFY pgrst, 'reload schema';
