-- =============================================================================
-- COPY EVERYTHING BELOW THIS LINE (from "DO $$" to "$$;") INTO SUPABASE SQL EDITOR
-- Do NOT paste the filename "supabase_enable_rls.sql" — only the SQL code.
-- =============================================================================
--
-- Enable Row Level Security (RLS) on all public tables so Supabase's Database Linter
-- is satisfied. Only the backend (Django) can access data; PostgREST/anon get no rows.
-- Policy allows both "postgres" and pooler "postgres.PROJECT_REF" so Django works.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  )
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    EXECUTE format(
      'DROP POLICY IF EXISTS "rls_allow_backend" ON %I.%I',
      r.schemaname, r.tablename
    );
    -- Allow full access for postgres and pooler (postgres.xxx); anon/authenticated still get no rows
    EXECUTE format(
      'CREATE POLICY "rls_allow_backend" ON %I.%I FOR ALL USING (current_user = ''postgres'' OR current_user LIKE ''postgres.%%'') WITH CHECK (current_user = ''postgres'' OR current_user LIKE ''postgres.%%'')',
      r.schemaname, r.tablename
    );
  END LOOP;
END $$;
