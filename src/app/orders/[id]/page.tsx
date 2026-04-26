'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useOrder, useOrderShipment, useOrderPayment, useCancelOrder, useInitiatePayment } from '@/hooks/use-orders'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { Order, OrderStatus, Shipment, Payment, PaymentStatus, ShipmentStatus } from '@/types/api'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Menunggu Pembayaran',
  paid: 'Pembayaran Diterima',
  processing: 'Sedang Diproses',
  shipped: 'Dalam Pengiriman',
  delivered: 'Telah Diterima',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  refunded: 'Dikembalikan',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  paid: 'text-blue-600 bg-blue-50 border-blue-200',
  processing: 'text-blue-600 bg-blue-50 border-blue-200',
  shipped: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-green-600 bg-green-50 border-green-200',
  completed: 'text-green-600 bg-green-50 border-green-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
  refunded: 'text-gray-600 bg-gray-50 border-gray-200',
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Menunggu',
  settlement: 'Berhasil',
  cancel: 'Dibatalkan',
  expire: 'Kedaluwarsa',
  refund: 'Dikembalikan',
  failed: 'Gagal',
}

const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  pending: 'Menunggu Pickup',
  picked_up: 'Sudah Diambil',
  in_transit: 'Dalam Perjalanan',
  delivered: 'Terkirim',
  returned: 'Dikembalikan',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: orderData, isLoading } = useOrder(id)
  const { data: shipmentData } = useOrderShipment(id)
  const { data: paymentData } = useOrderPayment(id)

  const cancelOrder = useCancelOrder()
  const initiatePayment = useInitiatePayment()

  const order = orderData?.data?.data
  const shipment = shipmentData?.data?.data
  const payment = paymentData?.data?.data

  if (isLoading) return <OrderDetailSkeleton />
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="font-medium">Pesanan tidak ditemukan</p>
        <Link href="/orders" className="mt-3 inline-block text-primary hover:underline text-sm">← Daftar pesanan</Link>
      </div>
    )
  }

  const status = order.status as OrderStatus
  const canCancel = ['pending_payment', 'paid'].includes(status)
  const canPay = status === 'pending_payment'

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-lg font-bold">Detail Pesanan</h1>
          <p className="text-xs text-muted-foreground">#{order.id.split('-')[0].toUpperCase()}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div className={`rounded-xl border p-4 ${STATUS_COLOR[status]}`}>
          <p className="font-semibold">{STATUS_LABEL[status]}</p>
          <p className="text-sm opacity-80 mt-0.5">{formatDate(order.created_at)}</p>
        </div>

        {/* Pay button */}
        {canPay && (
          <Button
            className="w-full"
            onClick={() => initiatePayment.mutate(order.id)}
            disabled={initiatePayment.isPending}
          >
            {initiatePayment.isPending ? 'Memproses...' : 'Bayar Sekarang →'}
          </Button>
        )}

        {/* Items */}
        <div className="border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Produk</h2>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1">{item.product_name}</p>
                <p className="text-muted-foreground text-xs">{item.variant_name} × {item.quantity}</p>
              </div>
              <span className="shrink-0 font-medium">{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Ongkir ({order.courier?.toUpperCase()} {order.courier_service})</span>
              <span>{formatRupiah(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t">
              <span>Total</span>
              <span className="text-primary">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border rounded-xl p-4 space-y-1">
          <h2 className="font-semibold mb-2">Alamat Pengiriman</h2>
          <p className="font-medium text-sm">{order.snapshot_address.recipient_name}</p>
          <p className="text-sm text-muted-foreground">{order.snapshot_address.phone}</p>
          <p className="text-sm text-muted-foreground">
            {order.snapshot_address.street}, {order.snapshot_address.city}, {order.snapshot_address.province} {order.snapshot_address.postal_code}
          </p>
        </div>

        {/* Payment info */}
        {payment && (
          <div className="border rounded-xl p-4 space-y-2">
            <h2 className="font-semibold">Pembayaran</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-medium ${payment.status === 'settlement' ? 'text-green-600' : payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                {PAYMENT_STATUS_LABEL[payment.status as PaymentStatus]}
              </span>
              <span className="text-muted-foreground">Metode</span>
              <span>{payment.payment_method || '-'}</span>
              <span className="text-muted-foreground">Jumlah</span>
              <span>{formatRupiah(payment.amount)}</span>
              {payment.paid_at && (
                <>
                  <span className="text-muted-foreground">Dibayar</span>
                  <span>{formatDate(payment.paid_at)}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Shipment info */}
        {shipment && (
          <div className="border rounded-xl p-4 space-y-2">
            <h2 className="font-semibold">Pengiriman</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{SHIPMENT_STATUS_LABEL[shipment.status as ShipmentStatus]}</span>
              <span className="text-muted-foreground">Kurir</span>
              <span>{shipment.courier?.toUpperCase()} {shipment.courier_service}</span>
              <span className="text-muted-foreground">No. Resi</span>
              <span className="font-mono font-medium">{shipment.tracking_number}</span>
              {shipment.shipped_at && (
                <>
                  <span className="text-muted-foreground">Dikirim</span>
                  <span>{formatDate(shipment.shipped_at)}</span>
                </>
              )}
              {shipment.delivered_at && (
                <>
                  <span className="text-muted-foreground">Diterima</span>
                  <span>{formatDate(shipment.delivered_at)}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="border rounded-xl p-4">
            <h2 className="font-semibold mb-1">Catatan</h2>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </div>
        )}

        {/* Cancel */}
        {canCancel && (
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive hover:bg-destructive/5"
            onClick={() => {
              if (confirm('Batalkan pesanan ini?')) cancelOrder.mutate(order.id)
            }}
            disabled={cancelOrder.isPending}
          >
            {cancelOrder.isPending ? 'Membatalkan...' : 'Batalkan Pesanan'}
          </Button>
        )}
      </div>
    </main>
  )
}

function OrderDetailSkeleton() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </main>
  )
}
