-- Fix login: allow authenticated users to read their OWN public.users row.
-- Required for Admin login (Admin role is excluded from users_select_directory).
--
-- Run once in Supabase → SQL Editor.
-- For the full app, prefer ../frontend_rls_policies.sql instead.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_self ON public.users;
CREATE POLICY users_select_self ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());
