-- Verification: trip counts by status (run in Supabase SQL Editor).
-- Explore page only loads rows where status = 'active'.
-- If you see pending/completed but zero active, the frontend grid will be empty.

SELECT status, count(*) AS n
FROM public.trips
GROUP BY status
ORDER BY status;

-- Optional: list a few rows to inspect agency_id / slug
-- SELECT id, title, slug, status, agency_id FROM public.trips ORDER BY created_at DESC LIMIT 20;
