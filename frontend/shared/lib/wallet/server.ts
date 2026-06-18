import type { SupabaseClient } from '@supabase/supabase-js'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { getWalletCurrency, getRandomWalletSeedBalance } from '@/shared/utils/currency'

export type WalletAccountType = 'traveler' | 'agency'

export async function ensureTravelerWallet(
  admin: SupabaseClient,
  userId: string
): Promise<{ walletId: string; balance: number; currency: string }> {
  const existing = await findWallet(admin, userId, 'traveler')
  if (existing) return existing

  const { data, error } = await admin.rpc('credit_wallet', {
    p_user_id: userId,
    p_amount: getRandomWalletSeedBalance(),
    p_type: 'seed',
    p_description: 'Welcome bonus',
    p_wallet_type: 'traveler',
  })

  if (error) throw new Error(formatSupabaseError(error))
  void data

  const created = await findWallet(admin, userId, 'traveler')
  if (!created) throw new Error('Traveler wallet created but failed to load.')
  return created
}

export async function ensureAgencyWallet(
  admin: SupabaseClient,
  userId: string
): Promise<{ walletId: string; balance: number; currency: string }> {
  const existing = await findWallet(admin, userId, 'agency')
  if (existing) return existing

  const now = new Date().toISOString()
  const { error } = await admin.from('wallets').insert({
    id: crypto.randomUUID(),
    user_id: userId,
    wallet_type: 'agency',
    balance: 0,
    currency: getWalletCurrency(),
    created_at: now,
    updated_at: now,
  })

  if (error) throw new Error(formatSupabaseError(error))

  const created = await findWallet(admin, userId, 'agency')
  if (!created) throw new Error('Agency wallet created but failed to load.')
  return created
}

async function findWallet(
  admin: SupabaseClient,
  userId: string,
  walletType: WalletAccountType
): Promise<{ walletId: string; balance: number; currency: string } | null> {
  const { data, error } = await admin
    .from('wallets')
    .select('id, balance, currency, wallet_type')
    .eq('user_id', userId)
    .eq('wallet_type', walletType)
    .maybeSingle()

  if (error) throw new Error(formatSupabaseError(error))
  if (!data) return null

  return {
    walletId: String(data.id),
    balance: Number(data.balance),
    currency: String(data.currency ?? getWalletCurrency()),
  }
}
