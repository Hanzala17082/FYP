-- Explore uses the Supabase anon key: PostgREST runs as role `anon` and RLS applies.
-- Django/seed connect as `postgres` (or similar) and bypass RLS, so rows can exist
-- in SQL while GET /rest/v1/trips still returns [] until policies allow `anon` to SELECT.
--
-- Run in Supabase → SQL Editor (one time per project, idempotent).
-- For the full app (bookings, reviews, trip embeds), run ../frontend_rls_policies.sql instead.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_directory ON public.users;
CREATE POLICY users_select_directory ON public.users
  FOR SELECT TO anon, authenticated
  USING (role IN ('Traveler', 'Agency'));

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agencies_select_public ON public.agencies;
CREATE POLICY agencies_select_public ON public.agencies
  FOR SELECT TO anon, authenticated
  USING (true);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trips_select_public ON public.trips;
CREATE POLICY trips_select_public ON public.trips
  FOR SELECT TO anon, authenticated
  USING (true);
