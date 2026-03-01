import { apiClient } from '@/shared/lib/api-client'
import {
  LoginRequestDTO,
  RegisterRequestDTO,
  AuthResponseDTO,
  ForgotPasswordRequestDTO,
  ResetPasswordRequestDTO,
} from '@/types/api/auth.types'

export const authService = {
  login: async (data: LoginRequestDTO) => {
    return apiClient.post<AuthResponseDTO>('/auth/login', data)
  },

  register: async (data: RegisterRequestDTO) => {
    return apiClient.post<AuthResponseDTO>('/auth/register', data)
  },

  forgotPassword: async (data: ForgotPasswordRequestDTO) => {
    return apiClient.post('/auth/forgot-password', data)
  },

  resetPassword: async (data: ResetPasswordRequestDTO) => {
    return apiClient.post('/auth/reset-password', data)
  },

  logout: async () => {
    return apiClient.post('/auth/logout')
  },

  refreshToken: async (refreshToken: string) => {
    return apiClient.post<AuthResponseDTO>('/auth/refresh', { refreshToken })
  },
}
