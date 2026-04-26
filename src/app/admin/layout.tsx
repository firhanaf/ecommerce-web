'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useLogout } from '@/hooks/use-auth'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/orders', label: 'Pesanan', icon: '📦' },
  { href: '/admin/products', label: 'Produk', icon: '🛍️' },
  { href: '/admin/categories', label: 'Kategori', icon: '🏷️' },
  { href: '/admin/users', label: 'Pengguna', icon: '👥' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const logout = useLogout()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0 fixed h-full">
        <div className="p-4 border-b border-gray-700">
          <Link href="/" className="text-lg font-bold text-white">🛒 Toko</Link>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-700 space-y-2">
          {user && (
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-56 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}
