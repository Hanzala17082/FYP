-- REHNUM frontend (Supabase JS + PostgREST): starter RLS policies
-- Run in Supabase SQL Editor after migrations applied. Adjust before production.
--
-- Hardening: `public.users` may still contain a legacy Django `password` column.
-- PostgREST returns all selected columns — drop or null it if you rely only on Supabase Auth:
--   ALTER TABLE public.users DROP COLUMN IF EXISTS password;

-- ---------------------------------------------------------------------------
-- Helpers (session user row mirrors auth.users id)
-- ---------------------------------------------------------------------------
-- Optional: create stable helper functions (SECURITY DEFINER) if you prefer.

-- ---------------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_self ON public.users;
CREATE POLICY users_select_self ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS users_select_admin ON public.users;
CREATE POLICY users_select_admin ON public.users
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users me WHERE me.id = auth.uid() AND me.role = 'Admin')
  );

-- Public traveler/agency cards (anonymous traveler profile pages).
DROP POLICY IF EXISTS users_select_directory ON public.users;
CREATE POLICY users_select_directory ON public.users
  FOR SELECT TO anon, authenticated
  USING (role IN ('Traveler', 'Agency'));

DROP POLICY IF EXISTS users_insert_own ON public.users;
CREATE POLICY users_insert_own ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- TRAVELER PROFILES
-- ---------------------------------------------------------------------------
ALTER TABLE public.traveler_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS traveler_profiles_select ON public.traveler_profiles;
CREATE POLICY traveler_profiles_select ON public.traveler_profiles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users me WHERE me.id = auth.uid() AND me.role = 'Admin')
  );

DROP POLICY IF EXISTS traveler_profiles_insert_own ON public.traveler_profiles;
CREATE POLICY traveler_profiles_insert_own ON public.traveler_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- AGENCIES (directory + own row)
-- ---------------------------------------------------------------------------
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agencies_select_public ON public.agencies;
CREATE POLICY agencies_select_public ON public.agencies
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS agencies_insert_own ON public.agencies;
CREATE POLICY agencies_insert_own ON public.agencies
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- TRIPS + nested trip tables (broad read; writes scoped)
-- ---------------------------------------------------------------------------
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trips_select_public ON public.trips;
CREATE POLICY trips_select_public ON public.trips
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS trips_insert_agency_admin ON public.trips;
CREATE POLICY trips_insert_agency_admin ON public.trips
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.agencies a
      WHERE a.id = agency_id AND a.user_id = auth.uid()
    )
  );

ALTER TABLE public.trip_highlights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trip_highlights_all ON public.trip_highlights;
CREATE POLICY trip_highlights_select ON public.trip_highlights FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS trip_highlights_write ON public.trip_highlights;
CREATE POLICY trip_highlights_write ON public.trip_highlights
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE t.id = trip_highlights.trip_id AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE t.id = trip_highlights.trip_id AND a.user_id = auth.uid()
    )
  );

ALTER TABLE public.trip_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trip_schedules_select ON public.trip_schedules;
CREATE POLICY trip_schedules_select ON public.trip_schedules FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS trip_schedules_write ON public.trip_schedules;
CREATE POLICY trip_schedules_write ON public.trip_schedules
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE t.id = trip_schedules.trip_id AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE t.id = trip_schedules.trip_id AND a.user_id = auth.uid()
    )
  );

ALTER TABLE public.trip_schedule_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trip_schedule_activities_select ON public.trip_schedule_activities;
CREATE POLICY trip_schedule_activities_select ON public.trip_schedule_activities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS trip_schedule_activities_write ON public.trip_schedule_activities;
CREATE POLICY trip_schedule_activities_write ON public.trip_schedule_activities
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trip_schedules s
      JOIN public.trips t ON t.id = s.trip_id
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE s.id = trip_schedule_activities.schedule_id AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trip_schedules s
      JOIN public.trips t ON t.id = s.trip_id
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE s.id = trip_schedule_activities.schedule_id AND a.user_id = auth.uid()
    )
  );

ALTER TABLE public.trip_recreational_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trip_recreational_select ON public.trip_recreational_activities;
CREATE POLICY trip_recreational_select ON public.trip_recreational_activities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS trip_recreational_write ON public.trip_recreational_activities;
CREATE POLICY trip_recreational_write ON public.trip_recreational_activities
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE t.id = trip_recreational_activities.trip_id AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE t.id = trip_recreational_activities.trip_id AND a.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------------
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bookings_select ON public.bookings;
CREATE POLICY bookings_select ON public.bookings
  FOR SELECT TO authenticated
  USING (
    traveler_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE t.id = bookings.trip_id AND a.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS bookings_insert_traveler ON public.bookings;
CREATE POLICY bookings_insert_traveler ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (traveler_id = auth.uid());

DROP POLICY IF EXISTS bookings_update_agency_admin ON public.bookings;
CREATE POLICY bookings_update_agency_admin ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE t.id = bookings.trip_id AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'Admin')
    OR EXISTS (
      SELECT 1 FROM public.trips t
      JOIN public.agencies a ON a.id = t.agency_id
      WHERE t.id = bookings.trip_id AND a.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reviews_select ON public.reviews;
CREATE POLICY reviews_select ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS reviews_insert_traveler ON public.reviews;
CREATE POLICY reviews_insert_traveler ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (traveler_id = auth.uid());
