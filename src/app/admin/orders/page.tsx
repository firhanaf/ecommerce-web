'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { Order, OrderStatus } from '@/types/api'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
}

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'pending_payment', label: 'Menunggu Bayar' },
  { value: 'paid', label: 'Sudah Bayar' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Terkirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

const STATUS_COLOR: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [shipmentForm, setShipmentForm] = useState({ tracking_number: '', courier: '', courier_service: '' })
  const [newStatus, setNewStatus] = useState('')
  const [shipmentStatus, setShipmentStatus] = useState('')

  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => adminApi.listOrders(page, 20, statusFilter || undefined),
  })

  const orders = data?.data?.data ?? []
  const meta = data?.data?.meta

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateOrderStatus(id, status),
    onSuccess: () => { toast.success('Status diperbarui'); qc.invalidateQueries({ queryKey: ['admin-orders'] }); setNewStatus('') },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const createShipment = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof shipmentForm }) => adminApi.createShipment(id, data),
    onSuccess: () => {
      toast.success('Shipment dibuat')
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      setShipmentForm({ tracking_number: '', courier: '', courier_service: '' })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const updateShipment = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateShipmentStatus(id, status),
    onSuccess: () => { toast.success('Status pengiriman diperbarui'); qc.invalidateQueries({ queryKey: ['admin-orders'] }); setShipmentStatus('') },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pesanan</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-md border text-sm focus:outline-none"
        >
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Order list */}
        <div className="space-y-2">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          ) : orders.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">Tidak ada pesanan</p>
          ) : (
            orders.map((order: any) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-shadow ${selectedOrder?.id === order.id ? 'border-primary ring-1 ring-primary' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">#{order.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{order.items?.length ?? 0} item · {order.courier?.toUpperCase()}</span>
                  <span className="font-bold text-primary">{formatRupiah(order.total)}</span>
                </div>
              </div>
            ))
          )}

          {meta && meta.total_pages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>←</Button>
              <span className="text-sm px-2 py-2 text-muted-foreground">{page}/{meta.total_pages}</span>
              <Button variant="outline" size="sm" disabled={page >= meta.total_pages} onClick={() => setPage((p) => p + 1)}>→</Button>
            </div>
          )}
        </div>

        {/* Order detail panel */}
        {selectedOrder ? (
          <div className="bg-white border rounded-xl p-5 space-y-4 h-fit sticky top-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">#{selectedOrder.id.split('-')[0].toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {/* Items */}
            <div className="space-y-1 text-sm">
              {selectedOrder.items?.map((item: any) => (
                <p key={item.id} className="text-muted-foreground">{item.product_name} · {item.variant_name} × {item.quantity} = {formatRupiah(item.subtotal)}</p>
              ))}
              <p className="font-bold pt-1 border-t">Total: {formatRupiah(selectedOrder.total)}</p>
            </div>

            {/* Address */}
            <div className="text-sm text-muted-foreground border rounded-lg p-2">
              <p className="font-medium text-foreground">{selectedOrder.snapshot_address?.recipient_name}</p>
              <p>{selectedOrder.snapshot_address?.street}, {selectedOrder.snapshot_address?.city}</p>
            </div>

            {/* Update status */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Update Status</Label>
              <div className="flex gap-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 h-9 px-2 rounded-md border text-sm"
                >
                  <option value="">Pilih status...</option>
                  {STATUS_OPTIONS.filter((s) => s.value).map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={() => newStatus && updateStatus.mutate({ id: selectedOrder.id, status: newStatus })}
                  disabled={!newStatus || updateStatus.isPending}
                >
                  Simpan
                </Button>
              </div>
            </div>

            {/* Create shipment */}
            {['paid', 'processing'].includes(selectedOrder.status) && (
              <div className="space-y-2 border-t pt-3">
                <Label className="text-xs font-semibold">Buat Shipment</Label>
                <Input
                  placeholder="No. Resi"
                  value={shipmentForm.tracking_number}
                  onChange={(e) => setShipmentForm((p) => ({ ...p, tracking_number: e.target.value }))}
                  className="text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Kurir (e.g. JNE)"
                    value={shipmentForm.courier}
                    onChange={(e) => setShipmentForm((p) => ({ ...p, courier: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Layanan (e.g. REG)"
                    value={shipmentForm.courier_service}
                    onChange={(e) => setShipmentForm((p) => ({ ...p, courier_service: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => createShipment.mutate({ id: selectedOrder.id, data: shipmentForm })}
                  disabled={!shipmentForm.tracking_number || createShipment.isPending}
                >
                  {createShipment.isPending ? 'Menyimpan...' : 'Buat Shipment'}
                </Button>
              </div>
            )}

            {/* Update shipment status */}
            {selectedOrder.status === 'shipped' && (
              <div className="space-y-2 border-t pt-3">
                <Label className="text-xs font-semibold">Update Status Pengiriman</Label>
                <div className="flex gap-2">
                  <select
                    value={shipmentStatus}
                    onChange={(e) => setShipmentStatus(e.target.value)}
                    className="flex-1 h-9 px-2 rounded-md border text-sm"
                  >
                    <option value="">Pilih status...</option>
                    <option value="in_transit">Dalam Perjalanan</option>
                    <option value="delivered">Terkirim</option>
                    <option value="returned">Dikembalikan</option>
                  </select>
                  <Button
                    size="sm"
                    onClick={() => shipmentStatus && updateShipment.mutate({ id: selectedOrder.id, status: shipmentStatus })}
                    disabled={!shipmentStatus || updateShipment.isPending}
                  >
                    Simpan
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border rounded-xl p-5 text-center text-muted-foreground text-sm h-fit">
            Pilih pesanan untuk melihat detail dan mengelola
          </div>
        )}
      </div>
    </div>
  )
}
