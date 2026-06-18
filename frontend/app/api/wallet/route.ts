import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import {
  loadAgencyWalletSummary,
  loadTravelerWalletSummary,
} from '@/shared/lib/wallet/load-summary'

export async function GET() {
  try {
    const auth = await requireAuthenticatedUser()
    if (!auth.ok) return auth.response

    const admin = createAdminSupabaseClient()
    const data =
      auth.user.role === 'Agency'
        ? await loadAgencyWalletSummary(admin, auth.user.id)
        : auth.user.role === 'Traveler'
          ? await loadTravelerWalletSummary(admin, auth.user.id)
          : null

    if (!data) {
      return NextResponse.json({ error: 'Wallet is not available for this account type.' }, { status: 403 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load wallet.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
