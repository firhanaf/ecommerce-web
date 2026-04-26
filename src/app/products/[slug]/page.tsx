'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/product-api'
import { useAddToCart } from '@/hooks/use-cart'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProductVariant } from '@/types/api'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { user } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug),
    enabled: !!slug,
  })

  const product = data?.data?.data
  const activeVariants = product?.variants?.filter((v) => v.is_active) ?? []
  const allImages = product?.images ?? []
  const primaryImage = allImages.find((i) => i.is_primary) ?? allImages[0]

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [qty, setQty] = useState(1)

  const addToCart = useAddToCart()

  const currentVariant = selectedVariant ?? (activeVariants.length === 1 ? activeVariants[0] : null)
  const displayImage = selectedImage ?? primaryImage?.url ?? null
  const price = currentVariant?.price ?? (activeVariants.length ? Math.min(...activeVariants.map((v) => v.price)) : 0)
  const stock = currentVariant?.stock ?? 0
  const outOfStock = currentVariant ? stock === 0 : false

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login')
      return
    }
    if (!currentVariant) return
    addToCart.mutate({ variant_id: currentVariant.id, quantity: qty })
  }

  if (isLoading) return <ProductDetailSkeleton />
  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="font-medium">Produk tidak ditemukan</p>
        <Link href="/products" className="mt-4 inline-block text-primary hover:underline text-sm">
          ← Kembali ke produk
        </Link>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-5 flex gap-1 items-center">
        <Link href="/" className="hover:text-foreground">Beranda</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">Produk</Link>
        <span>/</span>
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-50 border">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200">
                <span className="text-6xl">📦</span>
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    (selectedImage ?? primaryImage?.url) === img.url
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={img.url} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mt-2">
              {activeVariants.length > 1 && !currentVariant ? 'Mulai dari ' : ''}
              {formatRupiah(price)}
            </p>
          </div>

          {/* Variants */}
          {activeVariants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Pilih Varian</p>
              <div className="flex flex-wrap gap-2">
                {activeVariants.map((variant) => {
                  const isSelected = currentVariant?.id === variant.id
                  const soldOut = variant.stock === 0
                  return (
                    <button
                      key={variant.id}
                      onClick={() => { if (!soldOut) { setSelectedVariant(variant); setQty(1) } }}
                      disabled={soldOut}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      {variant.name}
                      {soldOut && <span className="ml-1 text-xs">(Habis)</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock */}
          {currentVariant && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Stok:</span>
              {stock > 0 ? (
                <Badge variant="secondary" className="font-normal">{stock} tersedia</Badge>
              ) : (
                <Badge variant="destructive" className="font-normal">Habis</Badge>
              )}
            </div>
          )}

          {/* Quantity */}
          {currentVariant && stock > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Jumlah</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-gray-50 text-lg leading-none font-medium disabled:opacity-40"
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(stock, q + 1))}
                    className="px-3 py-2 hover:bg-gray-50 text-lg leading-none font-medium disabled:opacity-40"
                    disabled={qty >= stock}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">Maks. {stock}</span>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={
                addToCart.isPending ||
                !currentVariant ||
                outOfStock ||
                (activeVariants.length > 1 && !selectedVariant)
              }
            >
              {addToCart.isPending
                ? 'Menambahkan...'
                : !user
                ? 'Masuk untuk beli'
                : !currentVariant && activeVariants.length > 1
                ? 'Pilih varian'
                : outOfStock
                ? 'Stok habis'
                : '+ Keranjang'}
            </Button>
            {user && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (!currentVariant) return
                  addToCart.mutate(
                    { variant_id: currentVariant.id, quantity: qty },
                    { onSuccess: () => router.push('/cart') }
                  )
                }}
                disabled={
                  addToCart.isPending ||
                  !currentVariant ||
                  outOfStock ||
                  (activeVariants.length > 1 && !selectedVariant)
                }
              >
                Beli Sekarang
              </Button>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium text-gray-700">Deskripsi Produk</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function ProductDetailSkeleton() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-2 mb-5">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="w-16 h-16 rounded-lg" />)}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-9 w-20 rounded-lg" />)}
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </main>
  )
}
