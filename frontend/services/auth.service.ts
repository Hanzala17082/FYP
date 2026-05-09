import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { ok } from '@/shared/lib/supabase/response'
import { fetchUserDTO } from '@/shared/lib/supabase/profile'
import type {
  LoginRequestDTO,
  RegisterRequestDTO,
  AuthResponseDTO,
  ForgotPasswordRequestDTO,
  ResetPasswordRequestDTO,
} from '@/types/api/auth.types'

export const authService = {
  login: async (data: LoginRequestDTO) => {
    const sb = createBrowserSupabaseClient()
    const { data: authData, error } = await sb.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password,
    })
    if (error) throw new Error(formatSupabaseError(error))

    const session = authData.session
    if (!session) throw new Error('No session returned.')

    const user = await fetchUserDTO(session.user.id)

    if (data.role && user.role !== data.role) {
      await sb.auth.signOut()
      throw new Error(`This account is registered as ${user.role}. Switch role or use the correct login.`)
    }

    return ok<AuthResponseDTO>({
      accessToken: session.access_token,
      refreshToken: session.refresh_token ?? '',
      user,
    })
  },

  register: async (data: RegisterRequestDTO) => {
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match.')
    }
    if (!data.agreeToTerms) {
      throw new Error('You must agree to the terms.')
    }

    const sb = createBrowserSupabaseClient()
    const { data: signUpData, error } = await sb.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
        },
      },
    })
    if (error) throw new Error(formatSupabaseError(error))

    const session = signUpData.session
    const uid = signUpData.user?.id
    if (!uid) throw new Error('Sign up failed: no user id.')

    if (!session) {
      throw new Error(
        'Account created. Confirm your email if required by Supabase Auth, then sign in. ' +
          '(Disable email confirmation in Supabase Dashboard → Authentication → Providers → Email for immediate local testing.)'
      )
    }

    const now = new Date().toISOString()
    const row = {
      id: uid,
      email: data.email.trim(),
      password: '!managed_by_supabase_auth',
      full_name: data.fullName,
      role: data.role,
      city: data.city || null,
      avatar_url: null,
      is_email_verified: !!signUpData.user?.email_confirmed_at,
      is_active: true,
      is_staff: false,
      is_superuser: false,
      last_login: null,
      created_at: now,
      updated_at: now,
    }

    const { error: insertUserErr } = await sb.from('users').insert(row)
    if (insertUserErr) throw new Error(formatSupabaseError(insertUserErr))

    if (data.role === 'Traveler') {
      const { error: tpErr } = await sb.from('traveler_profiles').insert({
        id: crypto.randomUUID(),
        user_id: uid,
        cnic: data.cnic || null,
        preferences: {},
      })
      if (tpErr) throw new Error(formatSupabaseError(tpErr))
    } else {
      const base = data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'agency'
      const slug = `${base}-${uid.slice(0, 8)}`
      const { error: agErr } = await sb.from('agencies').insert({
        id: crypto.randomUUID(),
        user_id: uid,
        agency_name: data.fullName,
        agency_slug: slug,
        description: '',
        location: data.city || '',
        verified: false,
      })
      if (agErr) throw new Error(formatSupabaseError(agErr))
    }

    const user = await fetchUserDTO(uid)
    return ok<AuthResponseDTO>({
      accessToken: session.access_token,
      refreshToken: session.refresh_token ?? '',
      user,
    })
  },

  forgotPassword: async (data: ForgotPasswordRequestDTO) => {
    const sb = createBrowserSupabaseClient()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await sb.auth.resetPasswordForEmail(data.email.trim(), {
      redirectTo: `${origin}/login`,
    })
    if (error) throw new Error(formatSupabaseError(error))
    return ok<null>(null)
  },

  resetPassword: async (data: ResetPasswordRequestDTO) => {
    const sb = createBrowserSupabaseClient()
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match.')
    }
    const { error } = await sb.auth.updateUser({ password: data.password })
    if (error) throw new Error(formatSupabaseError(error))
    return ok<null>(null)
  },

  logout: async () => {
    const sb = createBrowserSupabaseClient()
    const { error } = await sb.auth.signOut()
    if (error) throw new Error(formatSupabaseError(error))
    return ok<null>(null)
  },

  refreshToken: async (_refreshToken: string) => {
    const sb = createBrowserSupabaseClient()
    const { data, error } = await sb.auth.refreshSession()
    if (error || !data.session) throw new Error(error ? formatSupabaseError(error) : 'Refresh failed.')
    const user = await fetchUserDTO(data.session.user.id)
    return ok<AuthResponseDTO>({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token ?? '',
      user,
    })
  },
}
