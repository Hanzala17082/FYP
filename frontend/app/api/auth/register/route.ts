import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/shared/lib/supabase/admin'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { provisionAppUser, type AppUserRole } from '@/shared/lib/supabase/provision-user'
import { cnicValidationMessage } from '@/shared/utils/cnic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const fullName = String(body.fullName ?? '').trim()
    const email = String(body.email ?? '').trim()
    const city = String(body.city ?? '').trim()
    const password = String(body.password ?? '')
    const confirmPassword = String(body.confirmPassword ?? '')
    const role = body.role as AppUserRole
    const cnic = String(body.cnic ?? '').trim()

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email, and password are required.' }, { status: 400 })
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 })
    }
    if (!city) {
      return NextResponse.json({ error: 'Please select a city from the suggestions list.' }, { status: 400 })
    }
    if (role !== 'Traveler' && role !== 'Agency') {
      return NextResponse.json({ error: 'Invalid role.' }, { status: 400 })
    }
    if (role === 'Traveler') {
      const cnicError = cnicValidationMessage(cnic)
      if (cnicError) {
        return NextResponse.json({ error: cnicError }, { status: 400 })
      }
    }

    const admin = createAdminSupabaseClient()
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
    })

    if (error) {
      return NextResponse.json({ error: formatSupabaseError(error) }, { status: 400 })
    }

    const uid = data.user?.id
    if (!uid) {
      return NextResponse.json({ error: 'Sign up failed: no user id.' }, { status: 500 })
    }

    await provisionAppUser(admin, {
      uid,
      email,
      fullName,
      role,
      city,
      cnic: role === 'Traveler' ? cnic : null,
      isEmailVerified: true,
    })

    if (role === 'Traveler') {
      const { ensureTravelerWallet } = await import('@/shared/lib/wallet/server')
      await ensureTravelerWallet(admin, uid)
    } else if (role === 'Agency') {
      const { ensureAgencyWallet } = await import('@/shared/lib/wallet/server')
      await ensureAgencyWallet(admin, uid)
    }

    return NextResponse.json({ userId: uid })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Registration failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
