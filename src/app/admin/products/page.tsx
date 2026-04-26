'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productApi } from '@/lib/product-api'
import { adminApi } from '@/lib/admin-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types/api'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, searchQuery],
    queryFn: () => productApi.list({ page, limit: 20, search: searchQuery || undefined }),
  })

  const products = data?.data?.data ?? []
  const meta = data?.data?.meta

  const deleteProduct = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => { toast.success('Produk dihapus'); qc.invalidateQueries({ queryKey: ['admin-products'] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal menghapus'),
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <Link href="/admin/products/new">
          <Button>+ Tambah Produk</Button>
        </Link>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => { e.preventDefault(); setSearchQuery(search); setPage(1) }}
        className="flex gap-2 mb-5 max-w-sm"
      >
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." className="text-sm" />
        <Button type="submit" size="sm">Cari</Button>
      </form>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground w-16">Gambar</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Produk</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground w-28">Varian / Stok</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground w-24">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3"><Skeleton className="w-12 h-12 rounded-lg" /></td>
                  <td className="px-4 py-3">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center"><Skeleton className="h-8 w-16 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></td>
                  <td className="px-4 py-3 text-right"><Skeleton className="h-7 w-24 ml-auto" /></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  Tidak ada produk
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const primaryImage = product.images?.find((i) => i.is_primary) ?? product.images?.[0]
                const lowestPrice = product.variants?.length
                  ? Math.min(...product.variants.map((v) => v.price))
                  : 0
                const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) ?? 0
                const variantCount = product.variants?.length ?? 0

                return (
                  <tr key={product.id} className="border-t hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border">
                        {primaryImage ? (
                          <Image src={primaryImage.url} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lowestPrice > 0 ? formatRupiah(lowestPrice) : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="text-xs text-muted-foreground">{variantCount} varian</p>
                      <p className={`text-xs font-semibold mt-0.5 ${totalStock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                        {totalStock} stok
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {product.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/admin/products/${product.slug}`}>
                          <Button size="sm" variant="outline" className="text-xs h-7">Edit</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 text-destructive border-destructive hover:bg-destructive/5"
                          onClick={() => { if (confirm(`Hapus "${product.name}"?`)) deleteProduct.mutate(product.id) }}
                          disabled={deleteProduct.isPending}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Sebelumnya</Button>
          <span className="text-sm px-2 py-2 text-muted-foreground">{page} / {meta.total_pages}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.total_pages} onClick={() => setPage((p) => p + 1)}>Selanjutnya →</Button>
        </div>
      )}
    </div>
  )
}
