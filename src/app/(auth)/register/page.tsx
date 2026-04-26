'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRegister } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const register = useRegister()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      return
    }
    register.mutate({ name: form.name, email: form.email, phone: form.phone, password: form.password })
  }

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Daftar Akun</CardTitle>
        <CardDescription>Buat akun baru untuk mulai berbelanja</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" placeholder="Nama kamu" value={form.name} onChange={set('name')} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@contoh.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <Input id="phone" type="tel" placeholder="08123456789" value={form.phone} onChange={set('phone')} required />
            <p className="text-xs text-muted-foreground">Kode verifikasi akan dikirim ke nomor ini</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Min. 8 karakter" value={form.password} onChange={set('password')} required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Konfirmasi Password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Ulangi password"
              value={form.confirm}
              onChange={set('confirm')}
              required
            />
            {form.confirm && form.password !== form.confirm && (
              <p className="text-xs text-destructive">Password tidak cocok</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button
            type="submit"
            className="w-full"
            disabled={register.isPending || (!!form.confirm && form.password !== form.confirm)}
          >
            {register.isPending ? 'Memproses...' : 'Daftar'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
