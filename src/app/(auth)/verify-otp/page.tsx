'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useVerifyOTP, useResendOTP } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const COOLDOWN_SECONDS = 60

export default function VerifyOTPPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('user_id') ?? ''

  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [otpSent, setOtpSent] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasSent = useRef(false)

  const verify = useVerifyOTP()
  const resend = useResendOTP()

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS)
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Auto-kirim OTP saat halaman dibuka
  useEffect(() => {
    if (!userId || hasSent.current) return
    hasSent.current = true
    resend.mutate(userId, {
      onSuccess: () => {
        setOtpSent(true)
        startCooldown()
      },
    })
  }, [userId])

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleResend = () => {
    resend.mutate(userId, { onSuccess: startCooldown })
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    verify.mutate({ user_id: userId, code })
  }

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="text-5xl mb-2">📱</div>
        <CardTitle className="text-2xl">Verifikasi WhatsApp</CardTitle>
        <CardDescription>
          {resend.isPending && !otpSent
            ? 'Mengirim kode OTP ke WhatsApp kamu...'
            : 'Masukkan kode OTP yang dikirim ke WhatsApp kamu. Berlaku 5 menit.'}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleVerify}>
        <CardContent className="space-y-4">
          <Input
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-3xl tracking-[0.5em] font-mono h-14"
            maxLength={6}
            autoFocus
            disabled={!otpSent}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={verify.isPending || code.length < 6 || !otpSent}
          >
            {verify.isPending ? 'Memverifikasi...' : 'Verifikasi'}
          </Button>

          <div className="text-center">
            {!otpSent ? (
              <p className="text-sm text-muted-foreground">Mengirim OTP...</p>
            ) : cooldown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Kirim ulang dalam{' '}
                <span className="font-semibold tabular-nums text-foreground">{cooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resend.isPending}
                className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resend.isPending ? 'Mengirim...' : 'Tidak terima kode? Kirim ulang'}
              </button>
            )}
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
