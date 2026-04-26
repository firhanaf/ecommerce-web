'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForgotPassword } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const forgot = useForgotPassword()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    forgot.mutate(identifier)
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email atau nomor HP yang terdaftar. Kode OTP akan dikirim ke WhatsApp kamu.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email / Nomor HP</Label>
            <Input
              id="identifier"
              placeholder="email@contoh.com atau 08xxx"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button type="submit" className="w-full" disabled={forgot.isPending}>
            {forgot.isPending ? 'Mengirim...' : 'Kirim Kode OTP'}
          </Button>
          <Link href="/login" className="text-sm text-center text-primary hover:underline">
            Kembali ke halaman login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
