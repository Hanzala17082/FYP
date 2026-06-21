import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { createRouteHandlerSupabaseClient } from '@/shared/lib/supabase/route-handler'

export type AuthenticatedRouteUser = {
  id: string
  email?: string
  role: string
}

export async function requireAuthenticatedUser():
  Promise<
    | { ok: true; user: AuthenticatedRouteUser }
    | { ok: false; response: NextResponse }
  > {
  const { supabase } = await createRouteHandlerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
    }
  }

  const admin = createAdminSupabaseClient()
  const { data: profile, error: profileErr } = await admin
    .from('users')
    .select('role, email')
    .eq('id', user.id)
    .maybeSingle()

  if (profileErr || !profile) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Profile not found.' }, { status: 404 }),
    }
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: String((profile as { role: string }).role),
    },
  }
}
