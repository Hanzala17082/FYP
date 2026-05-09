-- DEV ONLY: make all pending trips visible on the public Explore page.
-- The app lists only status = 'active'; new trips from the UI are inserted as 'pending'.
-- Run in Supabase SQL Editor when you want every pending trip to show up without an admin approve flow.
-- Do NOT run blindly in production — prefer a proper admin approval workflow later.

UPDATE public.trips
SET status = 'active', updated_at = now()
WHERE status = 'pending';

-- Network / RLS quick check (from browser DevTools → Network):
-- - Request: GET .../rest/v1/trips?select=...&status=eq.active
-- - 200 with [] → usually data/filter (no active rows), not always RLS.
-- - 401/403 → API key or RLS blocking anon/authenticated reads.
-- - 400 with relationship hint → PostgREST embed does not match FK names.
