'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/admin-api'
import { productApi } from '@/lib/product-api'

function StatCard({ label, value, href, icon }: { label: string; value: string | number; href: string; icon: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders-count'],
    queryFn: () => adminApi.listOrders(1, 1),
  })
  const { data: usersData } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: () => adminApi.listUsers(1, 1),
  })
  const { data: productsData } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: () => productApi.list({ limit: 1 }),
  })
  const { data: pendingOrdersData } = useQuery({
    queryKey: ['admin-pending-orders'],
    queryFn: () => adminApi.listOrders(1, 5, 'pending_payment'),
  })

  const totalOrders = ordersData?.data?.meta?.total ?? 0
  const totalUsers = usersData?.data?.meta?.total ?? 0
  const totalProducts = productsData?.data?.meta?.total ?? 0
  const pendingOrders = pendingOrdersData?.data?.data ?? []

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Pesanan" value={totalOrders} href="/admin/orders" icon="📦" />
        <StatCard label="Total Produk" value={totalProducts} href="/admin/products" icon="🛍️" />
        <StatCard label="Total Pengguna" value={totalUsers} href="/admin/users" icon="👥" />
      </div>

      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Pesanan Menunggu Bayar</h2>
            <Link href="/admin/orders?status=pending_payment" className="text-xs text-primary hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="space-y-2">
            {pendingOrders.map((order: any) => (
              <Link
                key={order.id}
                href={`/admin/orders`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-sm"
              >
                <div>
                  <p className="font-medium">#{order.id.split('-')[0].toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{order.items?.length ?? 0} item</p>
                </div>
                <span className="font-bold text-primary">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.total)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
