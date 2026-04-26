'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/product-api'
import { ProductCard, ProductCardSkeleton } from '@/components/product/product-card'

export default function HomePage() {
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => productApi.list({ limit: 20 }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.listCategories(),
  })

  const products = productsData?.data?.data ?? []
  const categories = categoriesData?.data?.data ?? []

  return (
    <div className="space-y-8">
      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Kategori</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Link
              href="/products"
              className="shrink-0 px-4 py-2 rounded-full border text-sm font-medium hover:bg-primary hover:text-white hover:border-primary transition-colors"
            >
              Semua
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category_id=${cat.id}`}
                className="shrink-0 px-4 py-2 rounded-full border text-sm font-medium hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Produk Terbaru</h2>
          <Link href="/products" className="text-sm text-primary hover:underline">
            Lihat semua →
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">🛍️</p>
            <p>Belum ada produk tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
