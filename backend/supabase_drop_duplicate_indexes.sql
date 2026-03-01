-- Drop duplicate indexes reported by Supabase Database Linter (0009_duplicate_index).
-- Django creates indexes on ForeignKey columns; we also had explicit Meta.indexes on the same
-- columns, which created duplicates. Run this once in Supabase: SQL Editor → New query → paste → Run.
-- Keeps the canonical _id_ index per column and drops the duplicate (truncated-name) index.

-- bookings: duplicate on traveler_id and trip_id
DROP INDEX IF EXISTS public.bookings_travele_94b049_idx;
DROP INDEX IF EXISTS public.bookings_trip_id_2e5547_idx;

-- password_reset_tokens: duplicate on user_id
DROP INDEX IF EXISTS public.password_re_user_id_af59e2_idx;

-- refresh_tokens: duplicate on user_id
DROP INDEX IF EXISTS public.refresh_tok_user_id_46676d_idx;

-- reviews: duplicates on agency_id, traveler_id, trip_id
DROP INDEX IF EXISTS public.reviews_agency__47c49b_idx;
DROP INDEX IF EXISTS public.reviews_travele_0b565d_idx;
DROP INDEX IF EXISTS public.reviews_trip_id_a9e51b_idx;

-- trips: duplicate on agency_id
DROP INDEX IF EXISTS public.trips_agency__d8cc05_idx;
