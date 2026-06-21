/**
 * Auth-related API types. Data comes from the API, which reads/writes Supabase (users, tokens).
 */
export interface LoginRequestDTO {
  email: string
  password: string
  role?: 'Traveler' | 'Agency' | 'Admin'
}

export interface RegisterRequestDTO {
  fullName: string
  email: string
  city: string
  cnic: string
  password: string
  confirmPassword: string
  role: 'Traveler' | 'Agency'
  wantVerifiedAgency?: boolean
}

export interface AuthResponseDTO {
  accessToken: string
  refreshToken: string
  user: UserDTO
}

export interface UserDTO {
  id: string
  email: string
  fullName: string
  role: 'Traveler' | 'Agency' | 'Admin'
  city?: string
  avatar?: string
  createdAt: string
}

export interface ForgotPasswordRequestDTO {
  email: string
}

export interface ResetPasswordRequestDTO {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordRequestDTO {
  email: string
  currentPassword: string
  password: string
  confirmPassword: string
}
