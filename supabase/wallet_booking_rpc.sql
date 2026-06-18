-- Wallet RPC + RLS for REHNUM
-- Re-run in Supabase SQL Editor after schema migrations (wallet_type, agency_payout_status).

-- ---------------------------------------------------------------------------
-- RPC: create booking and debit TRAVELER wallet only (agency is paid on confirm)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking_with_wallet_debit(
  p_traveler_id UUID,
  p_trip_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_number_of_travelers INT,
  p_special_requests TEXT DEFAULT NULL,
  p_booking_id UUID DEFAULT gen_random_uuid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trip_price NUMERIC(12, 2);
  v_total NUMERIC(12, 2);
  v_wallet_id UUID;
  v_balance NUMERIC(12, 2);
  v_new_balance NUMERIC(12, 2);
  v_trip_title TEXT;
BEGIN
  IF p_number_of_travelers IS NULL OR p_number_of_travelers < 1 THEN
    RAISE EXCEPTION 'number_of_travelers must be at least 1';
  END IF;

  SELECT price, title INTO v_trip_price, v_trip_title
  FROM trips
  WHERE id = p_trip_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trip not found';
  END IF;

  v_total := v_trip_price * p_number_of_travelers;

  SELECT id, balance INTO v_wallet_id, v_balance
  FROM wallets
  WHERE user_id = p_traveler_id AND wallet_type = 'traveler'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Traveler wallet not found';
  END IF;

  IF v_balance < v_total THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  v_new_balance := v_balance - v_total;

  UPDATE wallets
  SET balance = v_new_balance, updated_at = NOW()
  WHERE id = v_wallet_id;

  INSERT INTO bookings (
    id, trip_id, traveler_id, start_date, end_date,
    number_of_travelers, status, special_requests,
    total_amount, payment_status, agency_payout_status,
    created_at, updated_at
  )
  VALUES (
    p_booking_id, p_trip_id, p_traveler_id, p_start_date, p_end_date,
    p_number_of_travelers, 'pending', p_special_requests,
    v_total, 'paid', 'pending', NOW(), NOW()
  );

  INSERT INTO wallet_transactions (
    id, wallet_id, type, amount, description, booking_id, created_at
  )
  VALUES (
    gen_random_uuid(), v_wallet_id, 'debit', -v_total,
    COALESCE('Booking: ' || v_trip_title, 'Trip booking'),
    p_booking_id, NOW()
  );

  RETURN jsonb_build_object(
    'booking_id', p_booking_id,
    'total_amount', v_total,
    'new_balance', v_new_balance
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- RPC: credit AGENCY wallet when booking is confirmed
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_agency_wallet_for_booking(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_agency_user_id UUID;
  v_wallet_id UUID;
  v_balance NUMERIC(12, 2);
  v_new_balance NUMERIC(12, 2);
  v_trip_title TEXT;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.agency_payout_status = 'paid' THEN
    RETURN jsonb_build_object(
      'booking_id', p_booking_id,
      'already_paid', true,
      'agency_balance', (
        SELECT balance FROM wallets w
        JOIN trips t ON t.id = v_booking.trip_id
        JOIN agencies a ON a.id = t.agency_id
        WHERE w.user_id = a.user_id AND w.wallet_type = 'agency'
      )
    );
  END IF;

  IF v_booking.payment_status <> 'paid'
     OR v_booking.total_amount IS NULL
     OR v_booking.total_amount <= 0 THEN
    RAISE EXCEPTION 'Booking payment is not eligible for agency payout';
  END IF;

  SELECT a.user_id, tr.title
  INTO v_agency_user_id, v_trip_title
  FROM trips tr
  JOIN agencies a ON a.id = tr.agency_id
  WHERE tr.id = v_booking.trip_id;

  IF v_agency_user_id IS NULL THEN
    RAISE EXCEPTION 'Agency not found for booking';
  END IF;

  SELECT id, balance INTO v_wallet_id, v_balance
  FROM wallets
  WHERE user_id = v_agency_user_id AND wallet_type = 'agency'
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO wallets (id, user_id, wallet_type, balance, currency, created_at, updated_at)
    VALUES (gen_random_uuid(), v_agency_user_id, 'agency', 0, 'PKR', NOW(), NOW())
    RETURNING id, balance INTO v_wallet_id, v_balance;
  END IF;

  v_new_balance := v_balance + v_booking.total_amount;

  UPDATE wallets
  SET balance = v_new_balance, updated_at = NOW()
  WHERE id = v_wallet_id;

  INSERT INTO wallet_transactions (
    id, wallet_id, type, amount, description, booking_id, created_at
  )
  VALUES (
    gen_random_uuid(), v_wallet_id, 'earning', v_booking.total_amount,
    COALESCE('Booking confirmed: ' || v_trip_title, 'Booking earning'),
    p_booking_id, NOW()
  );

  UPDATE bookings
  SET agency_payout_status = 'paid', updated_at = NOW()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object(
    'booking_id', p_booking_id,
    'payout_amount', v_booking.total_amount,
    'agency_balance', v_new_balance
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- RPC: refund TRAVELER wallet when booking is cancelled/rejected (before agency paid)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refund_booking_wallet(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_wallet_id UUID;
  v_balance NUMERIC(12, 2);
  v_new_balance NUMERIC(12, 2);
  v_trip_title TEXT;
BEGIN
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.payment_status = 'refunded' THEN
    RETURN jsonb_build_object(
      'booking_id', p_booking_id,
      'already_refunded', true,
      'new_balance', (
        SELECT balance FROM wallets
        WHERE user_id = v_booking.traveler_id AND wallet_type = 'traveler'
      )
    );
  END IF;

  IF v_booking.agency_payout_status = 'paid' THEN
    RAISE EXCEPTION 'Cannot refund traveler after agency has been paid';
  END IF;

  IF v_booking.payment_status <> 'paid'
     OR v_booking.total_amount IS NULL
     OR v_booking.total_amount <= 0 THEN
    RAISE EXCEPTION 'Booking is not eligible for refund';
  END IF;

  SELECT id, balance INTO v_wallet_id, v_balance
  FROM wallets
  WHERE user_id = v_booking.traveler_id AND wallet_type = 'traveler'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Traveler wallet not found';
  END IF;

  SELECT title INTO v_trip_title FROM trips WHERE id = v_booking.trip_id;

  v_new_balance := v_balance + v_booking.total_amount;

  UPDATE wallets
  SET balance = v_new_balance, updated_at = NOW()
  WHERE id = v_wallet_id;

  INSERT INTO wallet_transactions (
    id, wallet_id, type, amount, description, booking_id, created_at
  )
  VALUES (
    gen_random_uuid(), v_wallet_id, 'refund', v_booking.total_amount,
    COALESCE('Refund: ' || v_trip_title, 'Booking refund'),
    p_booking_id, NOW()
  );

  UPDATE bookings
  SET payment_status = 'refunded', updated_at = NOW()
  WHERE id = p_booking_id;

  RETURN jsonb_build_object(
    'booking_id', p_booking_id,
    'refund_amount', v_booking.total_amount,
    'new_balance', v_new_balance
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- RPC: seed / credit wallet (traveler demo top-up only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.credit_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT DEFAULT 'seed',
  p_description TEXT DEFAULT 'Wallet credit',
  p_wallet_type TEXT DEFAULT 'traveler'
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

  IF p_wallet_type = 'agency' THEN
    RAISE EXCEPTION 'Agency wallets are credited only when bookings are confirmed';
  END IF;

  SELECT id, balance INTO v_wallet_id, v_balance
  FROM wallets
  WHERE user_id = p_user_id AND wallet_type = p_wallet_type
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO wallets (id, user_id, wallet_type, balance, currency, created_at, updated_at)
    VALUES (gen_random_uuid(), p_user_id, p_wallet_type, p_amount, 'PKR', NOW(), NOW())
    RETURNING id, balance INTO v_wallet_id, v_new_balance;

    INSERT INTO wallet_transactions (id, wallet_id, type, amount, description, booking_id, created_at)
    VALUES (gen_random_uuid(), v_wallet_id, p_type, p_amount, p_description, NULL, NOW());

    RETURN jsonb_build_object('wallet_id', v_wallet_id, 'new_balance', v_new_balance);
  END IF;

  v_new_balance := v_balance + p_amount;

  UPDATE wallets SET balance = v_new_balance, updated_at = NOW() WHERE id = v_wallet_id;

  INSERT INTO wallet_transactions (id, wallet_id, type, amount, description, booking_id, created_at)
  VALUES (gen_random_uuid(), v_wallet_id, p_type, p_amount, p_description, NULL, NOW());

  RETURN jsonb_build_object('wallet_id', v_wallet_id, 'new_balance', v_new_balance);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking_with_wallet_debit TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_agency_wallet_for_booking TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_booking_wallet TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_wallet TO service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wallets_select_own ON public.wallets;
CREATE POLICY wallets_select_own ON public.wallets
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users me WHERE me.id = auth.uid() AND me.role = 'Admin')
  );

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wallet_transactions_select_own ON public.wallet_transactions;
CREATE POLICY wallet_transactions_select_own ON public.wallet_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wallets w
      WHERE w.id = wallet_transactions.wallet_id AND w.user_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.users me WHERE me.id = auth.uid() AND me.role = 'Admin')
  );

-- Fix agency accounts that incorrectly received traveler demo balances:
UPDATE public.wallets w
SET wallet_type = 'agency', balance = 0, updated_at = NOW()
FROM public.users u
WHERE w.user_id = u.id AND u.role = 'Agency';

UPDATE public.wallets w
SET wallet_type = 'traveler', updated_at = NOW()
FROM public.users u
WHERE w.user_id = u.id AND u.role = 'Traveler' AND w.wallet_type IS DISTINCT FROM 'traveler';
