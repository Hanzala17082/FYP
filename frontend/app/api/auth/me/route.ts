import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { createRouteHandlerSupabaseClient } from '@/shared/lib/supabase/route-handler'
import { mapUserRow } from '@/shared/lib/supabase/mappers'

/**
 * Returns the authenticated user's public.users profile.
 * Uses the service role so login works even when RLS has not been configured
 * for self-read (common after backend-only RLS or ensure_explore_anon_read.sql).
 */
export async function GET(request: Request) {
  let userId: string | null = null

  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()
    const admin = createAdminSupabaseClient()
    const { data, error } = await admin.auth.getUser(token)
    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 })
    }
    userId = data.user.id
  } else {
    const { supabase } = await createRouteHandlerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }
    userId = user.id
  }

  const admin = createAdminSupabaseClient()
  const { data, error } = await admin.from('users').select('*').eq('id', userId).maybeSingle()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json(
      {
        error:
          'No profile row in public.users for this account. Run `npm run seed:demo` from frontend/ to recreate demo users.',
      },
      { status: 404 }
    )
  }

  return NextResponse.json(mapUserRow(data as Record<string, unknown>))
}
