import type { User as SupabaseUser } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/shared/lib/supabase/client'
import { formatSupabaseError } from '@/shared/lib/supabase/format-error'
import { ok } from '@/shared/lib/supabase/response'
import { fetchUserDTO } from '@/shared/lib/supabase/profile'
import { appUserExists, provisionAppUser, type AppUserRole } from '@/shared/lib/supabase/user-provision'
import { cnicValidationMessage } from '@/shared/utils/cnic'
import type {
  LoginRequestDTO,
  RegisterRequestDTO,
  AuthResponseDTO,
  ForgotPasswordRequestDTO,
  ResetPasswordRequestDTO,
  ChangePasswordRequestDTO,
} from '@/types/api/auth.types'

const OAUTH_ROLE_KEY = 'oauth_role'

function getAuthRedirectOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
}

function resolveOAuthFullName(user: SupabaseUser): string {
  const meta = user.user_metadata ?? {}
  const fromMeta =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    ''
  if (fromMeta) return fromMeta
  const prefix = user.email?.split('@')[0]?.trim()
  return prefix || 'User'
}

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
    if (!data.city?.trim()) {
      throw new Error('Please select a city from the suggestions list.')
    }
    if (data.role === 'Traveler') {
      const cnicError = cnicValidationMessage(data.cnic)
      if (cnicError) throw new Error(cnicError)
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = (await res.json().catch(() => ({}))) as { error?: string; userId?: string }
    if (!res.ok) {
      throw new Error(body.error || 'Registration failed.')
    }

    const sb = createBrowserSupabaseClient()
    const { data: signInData, error: signInError } = await sb.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password,
    })
    if (signInError) throw new Error(formatSupabaseError(signInError))

    const session = signInData.session
    const uid = signInData.user?.id
    if (!session || !uid) throw new Error('Sign in failed after registration.')

    const user = await fetchUserDTO(uid)
    return ok<AuthResponseDTO>({
      accessToken: session.access_token,
      refreshToken: session.refresh_token ?? '',
      user,
    })
  },

  signInWithGoogle: async (role: AppUserRole) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(OAUTH_ROLE_KEY, role)
    }
    const sb = createBrowserSupabaseClient()
    const origin = getAuthRedirectOrigin()
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) throw new Error(formatSupabaseError(error))
  },

  completeOAuthSession: async (role: AppUserRole) => {
    const sb = createBrowserSupabaseClient()
    const {
      data: { session },
      error: sessionError,
    } = await sb.auth.getSession()
    if (sessionError) throw new Error(formatSupabaseError(sessionError))
    if (!session?.user) throw new Error('Google sign-in did not return a session. Try again.')

    const user = session.user
    const email = user.email?.trim()
    if (!email) throw new Error('Your Google account has no email address.')

    const exists = await appUserExists(sb, user.id)
    if (exists) {
      const profile = await fetchUserDTO(user.id)
      if (profile.role !== role) {
        await sb.auth.signOut()
        throw new Error(`This account is registered as ${profile.role}. Switch role or use the correct login.`)
      }
    } else {
      await provisionAppUser(sb, {
        uid: user.id,
        email,
        fullName: resolveOAuthFullName(user),
        role,
        isEmailVerified: !!user.email_confirmed_at,
      })
    }

    const profile = await fetchUserDTO(user.id)
    return ok<AuthResponseDTO>({
      accessToken: session.access_token,
      refreshToken: session.refresh_token ?? '',
      user: profile,
    })
  },

  forgotPassword: async (data: ForgotPasswordRequestDTO) => {
    const email = data.email.trim()
    const sb = createBrowserSupabaseClient()
    const origin = getAuthRedirectOrigin()
    const redirectTo = `${origin}/auth/confirm?next=/reset-password`

    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw new Error(formatSupabaseError(error))

    let resetLink: string | undefined
    if (process.env.NODE_ENV === 'development') {
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const body = (await res.json().catch(() => ({}))) as { resetLink?: string }
        if (res.ok && body.resetLink) resetLink = body.resetLink
      } catch {
        // Dev-only helper; native Supabase email already requested above.
      }
    }

    return ok<{ resetLink?: string } | null>(resetLink ? { resetLink } : null)
  },

  resetPassword: async (data: ResetPasswordRequestDTO) => {
    const sb = createBrowserSupabaseClient()
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match.')
    }
    const {
      data: { session },
    } = await sb.auth.getSession()
    if (!session) {
      throw new Error('Reset link expired or invalid. Request a new password reset email.')
    }
    const { error } = await sb.auth.updateUser({ password: data.password })
    if (error) throw new Error(formatSupabaseError(error))
    return ok<null>(null)
  },

  changePassword: async (data: ChangePasswordRequestDTO) => {
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match.')
    }
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }
    if (data.currentPassword === data.password) {
      throw new Error('New password must be different from your current password.')
    }

    const sb = createBrowserSupabaseClient()
    const { error: verifyError } = await sb.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.currentPassword,
    })
    if (verifyError) {
      throw new Error('Current password is incorrect.')
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
