import api from './api'
import type { ApiResponse, AuthTokens, User } from '@/types/api'

export interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
}

export interface LoginInput {
  identifier: string // email atau phone
  password: string
}

export const authApi = {
  register: (data: RegisterInput) =>
    api.post<ApiResponse<{ user_id: string }>>('/auth/register', data),

  verifyOTP: (user_id: string, code: string) =>
    api.post<ApiResponse<AuthTokens>>('/auth/verify-otp', { user_id, code }),

  resendOTP: (user_id: string) =>
    api.post<ApiResponse<null>>('/auth/resend-otp', { user_id }),

  login: (data: LoginInput) =>
    api.post<ApiResponse<AuthTokens>>('/auth/login', data),

  refresh: (refresh_token: string) =>
    api.post<ApiResponse<AuthTokens>>('/auth/refresh', { refresh_token }),

  forgotPassword: (identifier: string) =>
    api.post<ApiResponse<{ user_id: string }>>('/auth/forgot-password', { identifier }),

  resetPassword: (user_id: string, code: string, new_password: string) =>
    api.post<ApiResponse<null>>('/auth/reset-password', { user_id, code, new_password }),
}
