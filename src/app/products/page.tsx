'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/product-api'
import { ProductCard, ProductCardSkeleton } from '@/components/product/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const search = searchParams.get('search') ?? ''
  const categoryId = searchParams.get('category_id') ?? ''
  const page = Number(searchParams.get('page') ?? '1')

  const [searchInput, setSearchInput] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { search, category_id: categoryId, page }],
    queryFn: () => productApi.list({ search: search || undefined, category_id: categoryId || undefined, page, limit: 20 }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.listCategories(),
    staleTime: 5 * 60_000,
  })

  const products = productsData?.data?.data ?? []
  const meta = productsData?.data?.meta
  const categories = categoriesData?.data?.data ?? []

  // Sync search input when URL changes externally
  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const pushParams = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    const merged = { search: search || undefined, category_id: categoryId || undefined, page: page > 1 ? String(page) : undefined, ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    router.push(`/products?${params.toString()}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushParams({ search: value || undefined, page: undefined })
    }, 400)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    pushParams({ search: searchInput || undefined, page: undefined })
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-lg">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <SearchIcon />
          </span>
          <Input
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari produk..."
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="default">Cari</Button>
      </form>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <CategoryPill
          label="Semua"
          active={!categoryId}
          onClick={() => pushParams({ category_id: undefined, page: undefined })}
        />
        {categories.map((cat) => (
          <CategoryPill
            key={cat.id}
            label={cat.name}
            active={categoryId === cat.id}
            onClick={() => pushParams({ category_id: cat.id, page: undefined })}
          />
        ))}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Memuat...' : meta ? `${meta.total} produk ditemukan` : ''}
        </p>
        {search && (
          <button
            onClick={() => { setSearchInput(''); pushParams({ search: undefined, page: undefined }) }}
            className="text-sm text-primary hover:underline"
          >
            Hapus pencarian
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">Produk tidak ditemukan</p>
          <p className="text-sm mt-1">Coba kata kunci lain atau hapus filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => pushParams({ page: String(page - 1) })}
          >
            ← Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Halaman {page} / {meta.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.total_pages}
            onClick={() => pushParams({ page: String(page + 1) })}
          >
            Selanjutnya →
          </Button>
        </div>
      )}
    </main>
  )
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-white border-primary'
          : 'hover:bg-primary hover:text-white hover:border-primary'
      }`}
    >
      {label}
    </button>
  )
}
