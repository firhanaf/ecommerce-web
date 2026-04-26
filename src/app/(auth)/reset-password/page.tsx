'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useResetPassword } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('user_id') ?? ''

  const [form, setForm] = useState({ code: '', password: '', confirm: '' })
  const reset = useResetPassword()

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) return
    reset.mutate({ user_id: userId, code: form.code, new_password: form.password })
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>Masukkan kode OTP dari WhatsApp dan password baru kamu</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Kode OTP</Label>
            <Input
              id="code"
              placeholder="6 digit kode OTP"
              value={form.code}
              onChange={set('code')}
              className="font-mono tracking-widest"
              maxLength={6}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 karakter"
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Konfirmasi Password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Ulangi password baru"
              value={form.confirm}
              onChange={set('confirm')}
              required
            />
            {form.confirm && form.password !== form.confirm && (
              <p className="text-xs text-destructive">Password tidak cocok</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={reset.isPending || (!!form.confirm && form.password !== form.confirm)}
          >
            {reset.isPending ? 'Memproses...' : 'Reset Password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
