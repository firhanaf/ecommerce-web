'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from '@/hooks/use-address'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { Address } from '@/types/api'

type AddrForm = {
  recipient_name: string; phone: string; street: string
  city: string; province: string; postal_code: string; is_default: boolean
}

const emptyForm: AddrForm = { recipient_name: '', phone: '', street: '', city: '', province: '', postal_code: '', is_default: false }

export default function AddressesPage() {
  const { data, isLoading } = useAddresses()
  const addresses = data?.data?.data ?? []

  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()
  const setDefault = useSetDefaultAddress()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AddrForm>(emptyForm)

  const set = (k: keyof AddrForm, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateAddress.mutate({ id: editingId, data: form }, {
        onSuccess: () => { setEditingId(null); setForm(emptyForm); setShowForm(false) },
      })
    } else {
      createAddress.mutate(form, {
        onSuccess: () => { setShowForm(false); setForm(emptyForm) },
      })
    }
  }

  const startEdit = (addr: Address) => {
    setEditingId(addr.id)
    setForm({
      recipient_name: addr.recipient_name, phone: addr.phone,
      street: addr.street, city: addr.city, province: addr.province,
      postal_code: addr.postal_code, is_default: addr.is_default,
    })
    setShowForm(true)
  }

  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm) }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">Alamat Pengiriman</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          {addresses.map((addr) => (
            <div key={addr.id} className="border rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{addr.recipient_name}</p>
                    {addr.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Utama</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{addr.phone}</p>
                  <p className="text-muted-foreground">{addr.street}, {addr.city}, {addr.province} {addr.postal_code}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => startEdit(addr)} className="text-xs text-primary hover:underline">Edit</button>
                {!addr.is_default && (
                  <>
                    <span className="text-gray-300">·</span>
                    <button onClick={() => setDefault.mutate(addr.id)} disabled={setDefault.isPending} className="text-xs text-primary hover:underline">
                      Jadikan Utama
                    </button>
                  </>
                )}
                <span className="text-gray-300">·</span>
                <button
                  onClick={() => { if (confirm('Hapus alamat ini?')) deleteAddress.mutate(addr.id) }}
                  disabled={deleteAddress.isPending}
                  className="text-xs text-destructive hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}

          {addresses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-3xl mb-2">📍</p>
              <p className="text-sm">Belum ada alamat tersimpan</p>
            </div>
          )}
        </div>
      )}

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
          + Tambah Alamat
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold">{editingId ? 'Edit Alamat' : 'Alamat Baru'}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Nama Penerima</Label>
              <Input value={form.recipient_name} onChange={(e) => set('recipient_name', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">No. HP</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kode Pos</Label>
              <Input value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} required />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Alamat Lengkap</Label>
              <Input value={form.street} onChange={(e) => set('street', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kota</Label>
              <Input value={form.city} onChange={(e) => set('city', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Provinsi</Label>
              <Input value={form.province} onChange={(e) => set('province', e.target.value)} required />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={(e) => set('is_default', e.target.checked)} className="rounded" />
            Jadikan alamat utama
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={createAddress.isPending || updateAddress.isPending}>
              {createAddress.isPending || updateAddress.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button type="button" variant="outline" onClick={cancelForm}>Batal</Button>
          </div>
        </form>
      )}
    </main>
  )
}
