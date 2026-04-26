'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productApi } from '@/lib/product-api'
import { adminApi } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@/types/api'

export default function AdminCategoriesPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.listCategories(),
  })
  const categories = data?.data?.data ?? []

  const [form, setForm] = useState({ name: '', parent_id: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () => adminApi.createCategory({ name: form.name, parent_id: form.parent_id || null }),
    onSuccess: () => { toast.success('Kategori dibuat'); qc.invalidateQueries({ queryKey: ['categories'] }); setForm({ name: '', parent_id: '' }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const update = useMutation({
    mutationFn: (id: string) => adminApi.updateCategory(id, { name: form.name, parent_id: form.parent_id || null, is_active: true }),
    onSuccess: () => { toast.success('Kategori diperbarui'); qc.invalidateQueries({ queryKey: ['categories'] }); setEditingId(null); setForm({ name: '', parent_id: '' }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => { toast.success('Kategori dihapus'); qc.invalidateQueries({ queryKey: ['categories'] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal'),
  })

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setForm({ name: cat.name, parent_id: cat.parent_id ?? '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editingId) update.mutate(editingId)
    else create.mutate()
  }

  const parentCategories = categories.filter((c) => !c.parent_id)

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Manajemen Kategori</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-4 space-y-3 mb-6">
        <h2 className="font-semibold">{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
        <div className="space-y-1">
          <Label className="text-xs">Nama Kategori</Label>
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Kategori Induk (opsional)</Label>
          <select
            value={form.parent_id}
            onChange={(e) => setForm((p) => ({ ...p, parent_id: e.target.value }))}
            className="w-full h-10 px-3 rounded-md border text-sm focus:outline-none"
          >
            <option value="">Tidak ada (kategori utama)</option>
            {parentCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={create.isPending || update.isPending}>
            {create.isPending || update.isPending ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Tambah'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ name: '', parent_id: '' }) }}>
              Batal
            </Button>
          )}
        </div>
      </form>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          {categories.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Belum ada kategori</p>
          ) : (
            categories.map((cat, idx) => {
              const parent = categories.find((c) => c.id === cat.parent_id)
              return (
                <div key={cat.id} className={`flex items-center justify-between p-3 ${idx > 0 ? 'border-t' : ''}`}>
                  <div>
                    <p className="text-sm font-medium">{cat.name}</p>
                    {parent && <p className="text-xs text-muted-foreground">↳ {parent.name}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(cat)} className="text-xs text-primary hover:underline">Edit</button>
                    <button
                      onClick={() => { if (confirm(`Hapus "${cat.name}"?`)) remove.mutate(cat.id) }}
                      disabled={remove.isPending}
                      className="text-xs text-destructive hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
