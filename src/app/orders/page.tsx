'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useOrders } from '@/hooks/use-orders'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order, OrderStatus } from '@/types/api'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Menunggu Bayar',
  paid: 'Sudah Bayar',
  processing: 'Diproses',
  shipped: 'Dikirim',
  delivered: 'Terkirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  refunded: 'Dikembalikan',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useOrders(page)
  const orders = data?.data?.data ?? []
  const meta = data?.data?.meta

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Pesanan Saya</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium text-gray-700">Belum ada pesanan</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline text-sm">
            Mulai belanja →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}

      {meta && meta.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground px-2 py-2">{page} / {meta.total_pages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.total_pages} onClick={() => setPage((p) => p + 1)}>
            Selanjutnya →
          </Button>
        </div>
      )}
    </main>
  )
}

function OrderCard({ order }: { order: Order }) {
  const status = order.status as OrderStatus
  return (
    <Link href={`/orders/${order.id}`} className="block">
      <div className="border rounded-xl p-4 hover:shadow-sm transition-shadow space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">#{order.id.split('-')[0].toUpperCase()}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        <div className="text-sm space-y-0.5">
          {order.items.slice(0, 2).map((item) => (
            <p key={item.id} className="text-muted-foreground line-clamp-1">
              {item.product_name} · {item.variant_name} × {item.quantity}
            </p>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-muted-foreground">+{order.items.length - 2} item lainnya</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t">
          <span className="text-xs text-muted-foreground">
            {order.courier?.toUpperCase()} {order.courier_service}
          </span>
          <span className="font-bold text-primary">{formatRupiah(order.total)}</span>
        </div>
      </div>
    </Link>
  )
}
