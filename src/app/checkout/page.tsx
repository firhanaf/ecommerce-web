'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { useCartStore } from '@/store/cart-store'
import { useAddresses, useCreateAddress } from '@/hooks/use-address'
import { useCreateOrder } from '@/hooks/use-orders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { Address } from '@/types/api'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

const COURIERS = [
  { id: 'jne', name: 'JNE', services: ['REG', 'YES', 'OKE'] },
  { id: 'jnt', name: 'J&T', services: ['EZ', 'Express'] },
  { id: 'sicepat', name: 'SiCepat', services: ['BEST', 'HALU', 'REG'] },
  { id: 'pos', name: 'Pos Indonesia', services: ['Kilat Khusus', 'Biasa'] },
]

export default function CheckoutPage() {
  const router = useRouter()
  useCart()
  const { items } = useCartStore()

  const { data: addressData, isLoading: loadingAddresses } = useAddresses()
  const addresses = addressData?.data?.data ?? []
  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0] ?? null

  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [courier, setCourier] = useState(COURIERS[0].id)
  const [courierService, setCourierService] = useState(COURIERS[0].services[0])
  const [shippingCost, setShippingCost] = useState(15000)
  const [notes, setNotes] = useState('')
  const [showNewAddress, setShowNewAddress] = useState(false)

  const currentAddressId = selectedAddressId || defaultAddress?.id || ''
  const selectedAddress = addresses.find((a) => a.id === currentAddressId) ?? defaultAddress

  const createOrder = useCreateOrder()
  const createAddress = useCreateAddress()

  const [newAddr, setNewAddr] = useState({
    recipient_name: '', phone: '', street: '', city: '', province: '', postal_code: '', is_default: false,
  })

  const subtotal = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0)
  const total = subtotal + shippingCost

  const selectedCourier = COURIERS.find((c) => c.id === courier) ?? COURIERS[0]

  const handleCourierChange = (courierId: string) => {
    const c = COURIERS.find((x) => x.id === courierId) ?? COURIERS[0]
    setCourier(c.id)
    setCourierService(c.services[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAddressId) return
    createOrder.mutate({
      address_id: currentAddressId,
      courier,
      courier_service: courierService,
      notes,
      shipping_cost: shippingCost,
    })
  }

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault()
    createAddress.mutate(newAddr, {
      onSuccess: ({ data }) => {
        setSelectedAddressId(data.data.id)
        setShowNewAddress(false)
        setNewAddr({ recipient_name: '', phone: '', street: '', city: '', province: '', postal_code: '', is_default: false })
      },
    })
  }

  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">🛒</p>
        <p className="font-medium">Keranjang kosong</p>
        <Link href="/products" className="mt-4 inline-block text-primary hover:underline text-sm">Kembali belanja</Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Address Selection */}
            <section className="border rounded-xl p-4 space-y-3">
              <h2 className="font-semibold">Alamat Pengiriman</h2>

              {loadingAddresses ? (
                <div className="h-16 bg-gray-50 rounded-lg animate-pulse" />
              ) : addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada alamat tersimpan.</p>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <AddressOption
                      key={addr.id}
                      address={addr}
                      selected={currentAddressId === addr.id}
                      onSelect={() => setSelectedAddressId(addr.id)}
                    />
                  ))}
                </div>
              )}

              {!showNewAddress ? (
                <button type="button" onClick={() => setShowNewAddress(true)} className="text-sm text-primary hover:underline">
                  + Tambah alamat baru
                </button>
              ) : (
                <div className="border rounded-lg p-4 space-y-3 mt-2">
                  <p className="text-sm font-medium">Alamat Baru</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Nama Penerima</Label>
                      <Input value={newAddr.recipient_name} onChange={(e) => setNewAddr((p) => ({ ...p, recipient_name: e.target.value }))} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">No. HP</Label>
                      <Input value={newAddr.phone} onChange={(e) => setNewAddr((p) => ({ ...p, phone: e.target.value }))} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Kode Pos</Label>
                      <Input value={newAddr.postal_code} onChange={(e) => setNewAddr((p) => ({ ...p, postal_code: e.target.value }))} required />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Alamat Lengkap</Label>
                      <Input value={newAddr.street} onChange={(e) => setNewAddr((p) => ({ ...p, street: e.target.value }))} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Kota</Label>
                      <Input value={newAddr.city} onChange={(e) => setNewAddr((p) => ({ ...p, city: e.target.value }))} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Provinsi</Label>
                      <Input value={newAddr.province} onChange={(e) => setNewAddr((p) => ({ ...p, province: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button type="button" size="sm" onClick={handleSaveNewAddress} disabled={createAddress.isPending}>
                      {createAddress.isPending ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowNewAddress(false)}>
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </section>

            {/* Courier */}
            <section className="border rounded-xl p-4 space-y-3">
              <h2 className="font-semibold">Pengiriman</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Kurir</Label>
                  <select
                    value={courier}
                    onChange={(e) => handleCourierChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {COURIERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Layanan</Label>
                  <select
                    value={courierService}
                    onChange={(e) => setCourierService(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {selectedCourier.services.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Ongkos Kirim (Rp)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Masukkan ongkir sesuai tarif kurir</p>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="border rounded-xl p-4 space-y-2">
              <h2 className="font-semibold">Catatan (opsional)</h2>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan untuk penjual..."
                className="text-sm"
              />
            </section>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-4 space-y-4 sticky top-20">
              <h2 className="font-semibold">Ringkasan</h2>
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2">
                    <span className="text-muted-foreground line-clamp-1 flex-1">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="shrink-0">{formatRupiah(item.variant.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ongkir ({courier.toUpperCase()} {courierService})</span>
                  <span>{formatRupiah(shippingCost)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatRupiah(total)}</span>
              </div>

              {selectedAddress && (
                <div className="text-xs text-muted-foreground border rounded-lg p-2 space-y-0.5">
                  <p className="font-medium text-foreground">{selectedAddress.recipient_name}</p>
                  <p>{selectedAddress.street}, {selectedAddress.city}</p>
                  <p>{selectedAddress.province} {selectedAddress.postal_code}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={createOrder.isPending || !currentAddressId}
              >
                {createOrder.isPending ? 'Memproses...' : !currentAddressId ? 'Pilih alamat' : 'Buat Pesanan'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}

function AddressOption({ address, selected, onSelect }: { address: Address; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${selected ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-300'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 text-sm">
          <p className="font-medium">{address.recipient_name} <span className="font-normal text-muted-foreground">· {address.phone}</span></p>
          <p className="text-muted-foreground text-xs">{address.street}, {address.city}, {address.province} {address.postal_code}</p>
        </div>
        {address.is_default && (
          <span className="shrink-0 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Utama</span>
        )}
      </div>
    </button>
  )
}
