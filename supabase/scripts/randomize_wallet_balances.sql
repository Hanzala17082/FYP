-- Randomize all wallet balances to PKR 10,000,000 – 25,000,000 (inclusive).
-- Run in Supabase SQL Editor after wallets table exists.

UPDATE public.wallets
SET
  balance = (10000000 + floor(random() * 15000001))::numeric(12, 2),
  updated_at = NOW();

-- Optional: log one adjustment transaction per wallet (run only if you want ledger entries)
-- INSERT INTO public.wallet_transactions (id, wallet_id, type, amount, description, created_at)
-- SELECT
--   gen_random_uuid(),
--   w.id,
--   'seed',
--   w.balance,
--   'Demo balance adjustment (10M–25M random)',
--   NOW()
-- FROM public.wallets w;
