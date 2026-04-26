'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi, type LoginInput, type RegisterInput } from '@/lib/auth-api'
import { useAuthStore } from '@/store/auth-store'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: ({ data }) => {
      const { access_token, refresh_token, user } = data.data
      setAuth(user, access_token, refresh_token)
      toast.success('Login berhasil!')
      router.push(user.role === 'admin' ? '/admin' : '/')
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Login gagal'
      // Backend return 403 + error:"phone_not_verified" jika belum verifikasi
      if (error?.response?.data?.data?.user_id) {
        const userId = error.response.data.data.user_id
        toast.error('Nomor HP belum diverifikasi')
        window.location.href = `/verify-otp?user_id=${userId}`
        return
      }
      toast.error(msg)
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: ({ data }) => {
      toast.success('Registrasi berhasil! Silakan verifikasi nomor HP kamu.')
      router.push(`/verify-otp?user_id=${data.data.user_id}`)
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Registrasi gagal'
      toast.error(msg)
    },
  })
}

export function useVerifyOTP() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: ({ user_id, code }: { user_id: string; code: string }) =>
      authApi.verifyOTP(user_id, code),
    onSuccess: ({ data }) => {
      const { access_token, refresh_token, user } = data.data
      setAuth(user, access_token, refresh_token)
      toast.success('Verifikasi berhasil!')
      router.push(user.role === 'admin' ? '/admin' : '/')
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Kode OTP salah atau sudah expired'
      toast.error(msg)
    },
  })
}

export function useResendOTP() {
  return useMutation({
    mutationFn: (user_id: string) => authApi.resendOTP(user_id),
    onSuccess: () => toast.success('OTP berhasil dikirim ulang ke WhatsApp kamu'),
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Gagal mengirim OTP'
      toast.error(msg)
    },
  })
}

export function useForgotPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: (identifier: string) => authApi.forgotPassword(identifier),
    onSuccess: ({ data }) => {
      toast.success('Kode OTP dikirim ke WhatsApp kamu')
      router.push(`/reset-password?user_id=${data.data.user_id}`)
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Gagal mengirim OTP'
      toast.error(msg)
    },
  })
}

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: ({
      user_id,
      code,
      new_password,
    }: {
      user_id: string
      code: string
      new_password: string
    }) => authApi.resetPassword(user_id, code, new_password),
    onSuccess: () => {
      toast.success('Password berhasil diubah! Silakan login.')
      router.push('/login')
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Gagal reset password'
      toast.error(msg)
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const router = useRouter()

  return () => {
    clearAuth()
    toast.success('Berhasil logout')
    router.push('/login')
  }
}
