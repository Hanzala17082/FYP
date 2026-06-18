import type { SupabaseClient } from '@supabase/supabase-js'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import type { WalletSummaryDTO, WalletTransactionDTO } from '@/types/api/wallet.types'
import { getWalletCurrency } from '@/shared/utils/currency'
import { ensureAgencyWallet, ensureTravelerWallet } from '@/shared/lib/wallet/server'

function mapTransaction(row: Record<string, unknown>): WalletTransactionDTO {
  return {
    id: String(row.id),
    type: row.type as WalletTransactionDTO['type'],
    amount: Number(row.amount),
    description: String(row.description ?? ''),
    bookingId: row.booking_id ? String(row.booking_id) : undefined,
    createdAt: String(row.created_at ?? ''),
  }
}

async function loadWalletByType(
  admin: SupabaseClient,
  userId: string,
  walletType: 'traveler' | 'agency'
) {
  const { data: wallet, error: walletErr } = await admin
    .from('wallets')
    .select('id, balance, currency')
    .eq('user_id', userId)
    .eq('wallet_type', walletType)
    .single()

  if (walletErr || !wallet) {
    throw new Error(walletErr ? formatSupabaseError(walletErr) : 'Wallet not found.')
  }

  return wallet
}

export async function loadTravelerWalletSummary(
  admin: SupabaseClient,
  userId: string,
  options?: { ensure?: boolean }
): Promise<WalletSummaryDTO> {
  if (options?.ensure !== false) {
    await ensureTravelerWallet(admin, userId)
  }

  const wallet = await loadWalletByType(admin, userId, 'traveler')
  const walletId = String(wallet.id)

  const { data: txRows, error: txErr } = await admin
    .from('wallet_transactions')
    .select('id, type, amount, description, booking_id, created_at')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (txErr) throw new Error(formatSupabaseError(txErr))

  const transactions = (txRows ?? []).map((row) => mapTransaction(row as Record<string, unknown>))
  const totalSpent = transactions
    .filter((tx) => tx.type === 'debit')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  const { data: upcomingRows, error: upcomingErr } = await admin
    .from('bookings')
    .select('total_amount')
    .eq('traveler_id', userId)
    .eq('status', 'confirmed')
    .eq('payment_status', 'paid')

  if (upcomingErr) throw new Error(formatSupabaseError(upcomingErr))

  const upcomingPayments = (upcomingRows ?? []).reduce(
    (sum, row) => sum + Number((row as { total_amount?: number }).total_amount ?? 0),
    0
  )

  return {
    accountType: 'traveler',
    balance: Number(wallet.balance),
    currency: String(wallet.currency ?? getWalletCurrency()),
    totalSpent,
    upcomingPayments,
    transactions,
  }
}

export async function loadAgencyWalletSummary(
  admin: SupabaseClient,
  userId: string,
  options?: { ensure?: boolean }
): Promise<WalletSummaryDTO> {
  if (options?.ensure !== false) {
    await ensureAgencyWallet(admin, userId)
  }

  const wallet = await loadWalletByType(admin, userId, 'agency')
  const walletId = String(wallet.id)

  const { data: txRows, error: txErr } = await admin
    .from('wallet_transactions')
    .select('id, type, amount, description, booking_id, created_at')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (txErr) throw new Error(formatSupabaseError(txErr))

  const transactions = (txRows ?? []).map((row) => mapTransaction(row as Record<string, unknown>))
  const totalEarned = transactions
    .filter((tx) => tx.type === 'earning')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  const { data: agency, error: agencyErr } = await admin
    .from('agencies')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (agencyErr) throw new Error(formatSupabaseError(agencyErr))

  let pendingEarnings = 0
  if (agency) {
    const agencyId = String((agency as { id: string }).id)
    const { data: tripRows } = await admin.from('trips').select('id').eq('agency_id', agencyId)
    const tripIds = (tripRows ?? []).map((t: { id: string }) => t.id)
    if (tripIds.length > 0) {
      const { data: pendingRows, error: pendingErr } = await admin
        .from('bookings')
        .select('total_amount')
        .in('trip_id', tripIds)
        .eq('status', 'pending')
        .eq('payment_status', 'paid')
        .eq('agency_payout_status', 'pending')

      if (pendingErr) throw new Error(formatSupabaseError(pendingErr))
      pendingEarnings = (pendingRows ?? []).reduce(
        (sum, row) => sum + Number((row as { total_amount?: number }).total_amount ?? 0),
        0
      )
    }
  }

  return {
    accountType: 'agency',
    balance: Number(wallet.balance),
    currency: String(wallet.currency ?? getWalletCurrency()),
    totalEarned,
    pendingEarnings,
    totalSpent: 0,
    upcomingPayments: 0,
    transactions,
  }
}

/** @deprecated Use loadTravelerWalletSummary or loadAgencyWalletSummary */
export async function loadWalletSummary(
  admin: SupabaseClient,
  userId: string,
  options?: { ensure?: boolean }
): Promise<WalletSummaryDTO> {
  return loadTravelerWalletSummary(admin, userId, options)
}
