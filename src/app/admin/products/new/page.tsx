'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminApi } from '@/lib/admin-api'
import { productApi } from '@/lib/product-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface VariantDraft {
  name: string; price: string; stock: string; sku: string
}

export default function NewProductPage() {
  const router = useRouter()
  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => productApi.listCategories() })
  const categories = catData?.data?.data ?? []

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [variants, setVariants] = useState<VariantDraft[]>([{ name: '', price: '', stock: '0', sku: '' }])

  const addVariant = () => setVariants((p) => [...p, { name: '', price: '', stock: '0', sku: '' }])
  const removeVariant = (i: number) => setVariants((p) => p.filter((_, idx) => idx !== i))
  const setVariant = (i: number, k: keyof VariantDraft, v: string) =>
    setVariants((p) => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item))

  const create = useMutation({
    mutationFn: () => adminApi.createProduct({
      name: name.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      variants: variants.map((v) => ({
        name: v.name.trim(),
        price: Number(v.price),
        stock: Number(v.stock),
        sku: v.sku.trim(),
      })),
    }),
    onSuccess: () => {
      toast.success('Produk berhasil dibuat')
      router.push('/admin/products')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal membuat produk'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Nama produk wajib diisi'); return }
    if (variants.some((v) => !v.name || !v.price || Number(v.price) <= 0)) {
      toast.error('Setiap varian harus memiliki nama dan harga valid')
      return
    }
    create.mutate()
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Tambah Produk</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Informasi Produk</h2>
          <div className="space-y-1">
            <Label className="text-xs">Nama Produk *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Deskripsi</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="Deskripsi produk..."
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Kategori</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border text-sm focus:outline-none"
            >
              <option value="">Tidak ada kategori</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Varian Produk</h2>
            <Button type="button" size="sm" variant="outline" onClick={addVariant}>+ Tambah Varian</Button>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">Varian {i + 1}</p>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-xs text-destructive hover:underline">Hapus</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Nama Varian *</Label>
                  <Input value={v.name} onChange={(e) => setVariant(i, 'name', e.target.value)} placeholder="e.g. Merah / L / 500ml" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Harga (Rp) *</Label>
                  <Input type="number" min={1} value={v.price} onChange={(e) => setVariant(i, 'price', e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Stok</Label>
                  <Input type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, 'stock', e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">SKU (opsional)</Label>
                  <Input value={v.sku} onChange={(e) => setVariant(i, 'sku', e.target.value)} placeholder="SKU-001" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Menyimpan...' : 'Simpan Produk'}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline">Batal</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
