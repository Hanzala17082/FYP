-- Recalculate trip prices to PKR (Rs. 20,000 – 200,000) from duration and destination.
-- Run in Supabase SQL Editor after pulling latest backend.

CREATE OR REPLACE FUNCTION estimate_trip_price_pkr(p_days INT, p_destination TEXT)
RETURNS NUMERIC AS $$
DECLARE
  v_days INT := GREATEST(1, COALESCE(p_days, 1));
  v_dest TEXT := LOWER(COALESCE(p_destination, ''));
  v_daily INT := 9000;
  v_raw NUMERIC;
  v_rounded NUMERIC;
BEGIN
  IF v_dest ~ '(dubai|europe|london|paris|usa|america|bahamas|maldives|switzerland|tokyo|singapore|turkey|istanbul|bali|thailand)' THEN
    v_daily := 14000;
  ELSIF v_dest ~ '(hunza|skardu|gilgit|naran|swat|chitral|fairy|kaghan|neelum|astore|deosai|kalash)' THEN
    v_daily := 11000;
  ELSIF v_dest ~ '(lahore|karachi|islamabad|murree|rawalpindi|multan|peshawar|faisalabad|quetta|hyderabad|sialkot)' THEN
    v_daily := 7000;
  END IF;

  v_raw := v_daily * v_days;
  v_rounded := ROUND(v_raw / 1000.0) * 1000;
  RETURN LEAST(200000, GREATEST(20000, v_rounded));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

UPDATE trips
SET price = estimate_trip_price_pkr(duration_days, destination),
    updated_at = NOW()
WHERE TRUE;
