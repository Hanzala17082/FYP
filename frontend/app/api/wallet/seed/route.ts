import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { loadTravelerWalletSummary } from '@/shared/lib/wallet/load-summary'

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Demo wallet top-up is disabled in production.' }, { status: 403 })
  }

  try {
    const auth = await requireAuthenticatedUser()
    if (!auth.ok) return auth.response

    if (auth.user.role !== 'Traveler') {
      return NextResponse.json({ error: 'Wallet is only available for travelers.' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const amount = Number(body.amount ?? 10000)
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
      return NextResponse.json({ error: 'Enter a valid amount between 1 and 1,000,000.' }, { status: 400 })
    }

    const admin = createAdminSupabaseClient()
    const { error } = await admin.rpc('credit_wallet', {
      p_user_id: auth.user.id,
      p_amount: amount,
      p_type: 'topup',
      p_description: 'Demo top-up',
      p_wallet_type: 'traveler',
    })

    if (error) {
      return NextResponse.json({ error: formatSupabaseError(error) }, { status: 400 })
    }

    const data = await loadTravelerWalletSummary(admin, auth.user.id, { ensure: false })
    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to add demo balance.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
