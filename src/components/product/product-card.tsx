import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types/api'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function getLowestPrice(product: Product) {
  if (!product.variants?.length) return 0
  return Math.min(...product.variants.map((v) => v.price))
}

function getPrimaryImage(product: Product) {
  const primary = product.images?.find((img) => img.is_primary)
  return primary?.url ?? product.images?.[0]?.url ?? null
}

export function ProductCard({ product }: { product: Product }) {
  const price = getLowestPrice(product)
  const image = getPrimaryImage(product)
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <span className="text-4xl">📦</span>
            </div>
          )}
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">
                Habis
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
            {product.name}
          </p>
          <p className="text-base font-bold text-primary">
            {price > 0 ? formatRupiah(price) : 'Hubungi kami'}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
        <div className="h-5 bg-gray-100 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  )
}
