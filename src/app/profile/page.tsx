'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/auth-store'
import { useLogout } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const logout = useLogout()

  if (!user) return null

  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold">Profil Saya</h1>

      {/* Avatar + info */}
      <div className="border rounded-xl p-5 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <p className="font-bold text-lg">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">{user.phone || '-'}</p>
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {user.role === 'admin' ? 'Admin' : 'Pembeli'}
          </span>
        </div>
      </div>

      {/* Menu */}
      <div className="border rounded-xl overflow-hidden">
        <ProfileMenuItem href="/orders" label="Pesanan Saya" icon="📦" />
        <Separator />
        <ProfileMenuItem href="/profile/addresses" label="Alamat Pengiriman" icon="📍" />
      </div>

      <Button
        variant="outline"
        className="w-full text-destructive border-destructive hover:bg-destructive/5"
        onClick={logout}
      >
        Keluar
      </Button>
    </main>
  )
}

function ProfileMenuItem({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
