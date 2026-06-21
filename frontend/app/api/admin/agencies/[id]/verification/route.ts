import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { requireAuthenticatedUser } from '@/shared/lib/supabase/api-auth'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedUser()
  if (!auth.ok) return auth.response
  if (auth.user.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const action = body.action as 'approve' | 'reject'

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  const update =
    action === 'approve'
      ? {
          verified: true,
          verification_status: 'approved',
          verification_paid_until: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        }
      : {
          verified: false,
          verification_status: 'rejected',
          updated_at: new Date().toISOString(),
        }

  const { error } = await admin.from('agencies').update(update).eq('id', id)
  if (error) {
    return NextResponse.json({ error: formatSupabaseError(error) }, { status: 400 })
  }

  return NextResponse.json({ ok: true, action })
}
