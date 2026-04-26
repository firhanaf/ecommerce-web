import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        sessionStorage.setItem('access_token', accessToken)
        sessionStorage.setItem('refresh_token', refreshToken)
        // Set cookie agar middleware Next.js bisa cek auth tanpa akses sessionStorage
        document.cookie = `auth_user=1; path=/; SameSite=Lax`
        document.cookie = `auth_role=${user.role}; path=/; SameSite=Lax`
        set({ user, isAuthenticated: true })
      },

      clearAuth: () => {
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')
        document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
