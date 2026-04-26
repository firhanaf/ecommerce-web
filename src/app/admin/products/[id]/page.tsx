'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productApi } from '@/lib/product-api'
import { adminApi } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { Product, ProductVariant } from '@/types/api'

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()

  // id param here is actually the slug (we link by slug from the products list)
  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin-product-detail', id],
    queryFn: () => productApi.getBySlug(id),
    enabled: !!id,
  })

  const product = productData?.data?.data
  const productId = product?.id ?? ''
  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => productApi.listCategories() })
  const categories = catData?.data?.data ?? []

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description ?? '')
      setCategoryId(product.category_id ?? '')
      setIsActive(product.is_active)
    }
  }, [product])

  const updateProduct = useMutation({
    mutationFn: () => adminApi.updateProduct(productId, { name, description, category_id: categoryId || null, is_active: isActive }),
    onSuccess: () => { toast.success('Produk diperbarui'); qc.invalidateQueries({ queryKey: ['admin-product-detail', id] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const uploadImage = useMutation({
    mutationFn: ({ file, isPrimary }: { file: File; isPrimary: boolean }) => adminApi.uploadImage(productId, file, isPrimary),
    onSuccess: () => { toast.success('Gambar diupload'); qc.invalidateQueries({ queryKey: ['admin-product-detail', id] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal upload gambar'),
  })

  const deleteImage = useMutation({
    mutationFn: (imageId: string) => adminApi.deleteImage(productId, imageId),
    onSuccess: () => { toast.success('Gambar dihapus'); qc.invalidateQueries({ queryKey: ['admin-product-detail', id] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const imageInputRef = useRef<HTMLInputElement>(null)
  const [isPrimaryUpload, setIsPrimaryUpload] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadImage.mutate({ file, isPrimary: isPrimaryUpload })
    e.target.value = ''
  }

  if (!product && !isLoading) {
    return (
      <div className="p-6 max-w-2xl">
        <p className="text-muted-foreground">Produk tidak ditemukan. ID mungkin tidak valid.</p>
        <Link href="/admin/products" className="text-primary hover:underline text-sm mt-2 inline-block">← Kembali</Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Edit Produk</h1>
      </div>

      {!product ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Basic info */}
          <div className="bg-white border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold">Informasi Produk</h2>
            <div className="space-y-1">
              <Label className="text-xs">Nama Produk</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Deskripsi</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                  className="w-full h-10 px-3 rounded-md border text-sm focus:outline-none"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold">Gambar Produk</h2>
            <div className="flex flex-wrap gap-3">
              {product.images?.map((img) => (
                <div key={img.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border">
                  <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                  {img.is_primary && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] text-center py-0.5">Utama</div>
                  )}
                  <button
                    onClick={() => { if (confirm('Hapus gambar ini?')) deleteImage.mutate(img.id) }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs items-center justify-center hidden group-hover:flex"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => { setIsPrimaryUpload(false); imageInputRef.current?.click() }}
                disabled={uploadImage.isPending}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center text-gray-400 hover:text-primary text-xs transition-colors"
              >
                {uploadImage.isPending ? '...' : (
                  <>
                    <span className="text-2xl">+</span>
                    <span>Tambah</span>
                  </>
                )}
              </button>
            </div>
            {product.images?.length === 0 && !uploadImage.isPending && (
              <Button size="sm" variant="outline" onClick={() => { setIsPrimaryUpload(true); imageInputRef.current?.click() }}>
                Upload Gambar Utama
              </Button>
            )}
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>

          {/* Variants */}
          <VariantsSection productId={productId} slugKey={id} variants={product.variants ?? []} />

          {/* Simpan — di bawah sendiri agar user baca semua section dulu */}
          <div className="bg-white border rounded-xl p-5 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Pastikan semua informasi, gambar, dan varian sudah benar sebelum menyimpan.
            </p>
            <Button
              onClick={() => updateProduct.mutate()}
              disabled={updateProduct.isPending}
              className="shrink-0"
            >
              {updateProduct.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function VariantsSection({ productId, slugKey, variants }: { productId: string; slugKey: string; variants: ProductVariant[] }) {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '0', sku: '', is_active: true })
  const [stockEdit, setStockEdit] = useState<{ id: string; value: string } | null>(null)

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }))

  const addVariant = useMutation({
    mutationFn: () => adminApi.createVariant(productId, {
      name: form.name, price: Number(form.price), stock: Number(form.stock), sku: form.sku,
    }),
    onSuccess: () => { toast.success('Varian ditambahkan'); qc.invalidateQueries({ queryKey: ['admin-product-detail', slugKey] }); setShowAdd(false); setForm({ name: '', price: '', stock: '0', sku: '', is_active: true }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const updateVariant = useMutation({
    mutationFn: (variantId: string) => adminApi.updateVariant(productId, variantId, {
      name: form.name, price: Number(form.price), stock: Number(form.stock), sku: form.sku, is_active: form.is_active,
    }),
    onSuccess: () => { toast.success('Varian diperbarui'); qc.invalidateQueries({ queryKey: ['admin-product-detail', slugKey] }); setEditingId(null) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const deleteVariant = useMutation({
    mutationFn: (variantId: string) => adminApi.deleteVariant(productId, variantId),
    onSuccess: () => { toast.success('Varian dihapus'); qc.invalidateQueries({ queryKey: ['admin-product-detail', slugKey] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const adjustStock = useMutation({
    mutationFn: ({ variantId, stock }: { variantId: string; stock: number }) => adminApi.adjustStock(productId, variantId, stock),
    onSuccess: () => { toast.success('Stok diperbarui'); qc.invalidateQueries({ queryKey: ['admin-product-detail', slugKey] }); setStockEdit(null) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const startEdit = (v: ProductVariant) => {
    setEditingId(v.id)
    setForm({ name: v.name, price: String(v.price), stock: String(v.stock), sku: v.sku ?? '', is_active: v.is_active })
    setShowAdd(false)
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

  const VariantForm = ({ onSave, onCancel, isPending }: { onSave: () => void; onCancel: () => void; isPending: boolean }) => (
    <div className="border rounded-lg p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Nama Varian *</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Merah / L" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Harga (Rp) *</Label>
          <Input type="number" min={1} value={form.price} onChange={(e) => set('price', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Stok</Label>
          <Input type="number" min={0} value={form.stock} onChange={(e) => set('stock', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">SKU</Label>
          <Input value={form.sku} onChange={(e) => set('sku', e.target.value)} />
        </div>
        {editingId && (
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <select value={form.is_active ? 'active' : 'inactive'} onChange={(e) => set('is_active', e.target.value === 'active')} className="w-full h-10 px-3 rounded-md border text-sm">
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={isPending}>{isPending ? 'Menyimpan...' : 'Simpan'}</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Batal</Button>
      </div>
    </div>
  )

  return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Varian Produk</h2>
        {!showAdd && !editingId && (
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>+ Tambah Varian</Button>
        )}
      </div>

      {showAdd && (
        <VariantForm
          onSave={() => { if (!form.name || !form.price) { toast.error('Nama dan harga wajib'); return } addVariant.mutate() }}
          onCancel={() => { setShowAdd(false); setForm({ name: '', price: '', stock: '0', sku: '', is_active: true }) }}
          isPending={addVariant.isPending}
        />
      )}

      <div className="space-y-2">
        {variants.length === 0 && !showAdd ? (
          <p className="text-sm text-muted-foreground text-center py-4">Belum ada varian</p>
        ) : (
          variants.map((v) => (
            <div key={v.id}>
              {editingId === v.id ? (
                <VariantForm
                  onSave={() => { if (!form.name || !form.price) { toast.error('Nama dan harga wajib'); return } updateVariant.mutate(v.id) }}
                  onCancel={() => setEditingId(null)}
                  isPending={updateVariant.isPending}
                />
              ) : (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{v.name}</p>
                      {!v.is_active && <span className="text-xs text-muted-foreground">(Nonaktif)</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{formatRupiah(v.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {stockEdit?.id === v.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          value={stockEdit.value}
                          onChange={(e) => setStockEdit({ id: v.id, value: e.target.value })}
                          className="w-20 h-7 text-xs"
                        />
                        <Button size="sm" className="h-7 text-xs px-2" onClick={() => adjustStock.mutate({ variantId: v.id, stock: Number(stockEdit.value) })}>
                          OK
                        </Button>
                        <button onClick={() => setStockEdit(null)} className="text-xs text-muted-foreground">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setStockEdit({ id: v.id, value: String(v.stock) })} className="text-xs text-muted-foreground hover:text-foreground">
                        Stok: {v.stock}
                      </button>
                    )}
                    <button onClick={() => startEdit(v)} className="text-xs text-primary hover:underline">Edit</button>
                    <button
                      onClick={() => { if (confirm(`Hapus varian "${v.name}"?`)) deleteVariant.mutate(v.id) }}
                      disabled={deleteVariant.isPending}
                      className="text-xs text-destructive hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
