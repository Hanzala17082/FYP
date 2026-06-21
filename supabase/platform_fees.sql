-- Platform fees + agency verification workflow for REHNUM
-- Run in Supabase SQL Editor after wallet_booking_rpc.sql.
--
-- Adds:
--   1. agencies.verification_status + agencies.verification_paid_until
--   2. platform_fees table (verification + per-trip listing fees)
--   3. RLS so admins and the owning agency can read their fee rows

-- ---------------------------------------------------------------------------
-- 1. Agency verification columns
-- ---------------------------------------------------------------------------
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS verification_paid_until TIMESTAMPTZ;

-- Allowed values: 'none' | 'pending_approval' | 'approved' | 'rejected'
ALTER TABLE public.agencies DROP CONSTRAINT IF EXISTS agencies_verification_status_check;
ALTER TABLE public.agencies
  ADD CONSTRAINT agencies_verification_status_check
  CHECK (verification_status IN ('none', 'pending_approval', 'approved', 'rejected'));

-- ---------------------------------------------------------------------------
-- 2. platform_fees table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('verification', 'trip_listing')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS platform_fees_agency_idx ON public.platform_fees (agency_id, created_at DESC);
CREATE INDEX IF NOT EXISTS platform_fees_created_idx ON public.platform_fees (created_at DESC);

-- ---------------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.platform_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_fees_select_own ON public.platform_fees;
CREATE POLICY platform_fees_select_own ON public.platform_fees
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.agencies a
      WHERE a.id = platform_fees.agency_id AND a.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.users me WHERE me.id = auth.uid() AND me.role = 'Admin')
  );

-- ---------------------------------------------------------------------------
-- 4. RPC: debit an agency wallet for a platform fee and record it
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.pay_agency_platform_fee(
  p_agency_user_id UUID,
  p_amount NUMERIC,
  p_fee_type TEXT,
  p_trip_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agency_id UUID;
  v_wallet_id UUID;
  v_balance NUMERIC(12, 2);
  v_new_balance NUMERIC(12, 2);
  v_fee_id UUID := gen_random_uuid();
  v_description TEXT;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  IF p_fee_type NOT IN ('verification', 'trip_listing') THEN
    RAISE EXCEPTION 'Invalid fee type: %', p_fee_type;
  END IF;

  SELECT id INTO v_agency_id
  FROM agencies
  WHERE user_id = p_agency_user_id;

  IF v_agency_id IS NULL THEN
    RAISE EXCEPTION 'Agency not found for user';
  END IF;

  SELECT id, balance INTO v_wallet_id, v_balance
  FROM wallets
  WHERE user_id = p_agency_user_id AND wallet_type = 'agency'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agency wallet not found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  v_new_balance := v_balance - p_amount;

  UPDATE wallets
  SET balance = v_new_balance, updated_at = NOW()
  WHERE id = v_wallet_id;

  v_description := CASE p_fee_type
    WHEN 'verification' THEN 'Verified agency fee'
    WHEN 'trip_listing' THEN 'Trip listing fee'
    ELSE 'Platform fee'
  END;

  INSERT INTO wallet_transactions (id, wallet_id, type, amount, description, booking_id, created_at)
  VALUES (gen_random_uuid(), v_wallet_id, 'debit', -p_amount, v_description, NULL, NOW());

  INSERT INTO platform_fees (id, agency_id, trip_id, fee_type, amount, created_at)
  VALUES (v_fee_id, v_agency_id, p_trip_id, p_fee_type, p_amount, NOW());

  RETURN jsonb_build_object(
    'fee_id', v_fee_id,
    'new_balance', v_new_balance
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. RPC (dev only): top up an agency wallet so inline fees can be paid
--    Real production top-ups require a payment gateway (out of scope).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_agency_wallet_demo(
  p_user_id UUID,
  p_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance NUMERIC(12, 2);
  v_new_balance NUMERIC(12, 2);
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT id, balance INTO v_wallet_id, v_balance
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = 'agency'
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO wallets (id, user_id, wallet_type, balance, currency, created_at, updated_at)
    VALUES (gen_random_uuid(), p_user_id, 'agency', p_amount, 'PKR', NOW(), NOW())
    RETURNING id, balance INTO v_wallet_id, v_new_balance;

    INSERT INTO wallet_transactions (id, wallet_id, type, amount, description, booking_id, created_at)
    VALUES (gen_random_uuid(), v_wallet_id, 'topup', p_amount, 'Demo top-up', NULL, NOW());

    RETURN jsonb_build_object('wallet_id', v_wallet_id, 'new_balance', v_new_balance);
  END IF;

  v_new_balance := v_balance + p_amount;

  UPDATE wallets SET balance = v_new_balance, updated_at = NOW() WHERE id = v_wallet_id;

  INSERT INTO wallet_transactions (id, wallet_id, type, amount, description, booking_id, created_at)
  VALUES (gen_random_uuid(), v_wallet_id, 'topup', p_amount, 'Demo top-up', NULL, NOW());

  RETURN jsonb_build_object('wallet_id', v_wallet_id, 'new_balance', v_new_balance);
END;
$$;

GRANT EXECUTE ON FUNCTION public.pay_agency_platform_fee TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_agency_wallet_demo TO service_role;
