-- Migration: 20260124_fix_reports_fk.sql
-- Purpose: Change reporter_id FK to reference profiles for PostgREST joins.

DO $$
BEGIN
  -- Try to drop the constraint if it follows standard naming
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_reporter_id_fkey') THEN
      ALTER TABLE public.reports DROP CONSTRAINT reports_reporter_id_fkey;
  END IF;
END $$;

-- Re-add constraint pointing to profiles
ALTER TABLE public.reports
    ADD CONSTRAINT reports_reporter_id_fkey
    FOREIGN KEY (reporter_id)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;
