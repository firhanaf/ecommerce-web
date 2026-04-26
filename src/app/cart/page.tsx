'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/use-cart'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { CartItem } from '@/types/api'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function CartPage() {
  const router = useRouter()
  const { isLoading } = useCart()
  const { items } = useCartStore()

  const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)

  if (isLoading) return <CartSkeleton />

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-6">Keranjang Belanja</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-lg font-medium text-gray-700">Keranjang kamu kosong</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Yuk mulai belanja!</p>
          <Link href="/products">
            <Button>Lihat Produk</Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-4 space-y-4 sticky top-20">
              <h2 className="font-semibold text-gray-800">Ringkasan Pesanan</h2>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
                  <span className="font-medium">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Ongkir dihitung saat checkout</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatRupiah(subtotal)}</span>
              </div>
              <Button className="w-full" onClick={() => router.push('/checkout')}>
                Checkout ({items.length} item)
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function CartItemRow({ item }: { item: CartItem }) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  const image = null // CartItem doesn't carry image directly
  const price = item.variant.price

  return (
    <div className="flex gap-4 border rounded-xl p-4">
      {/* Image placeholder */}
      <div className="w-20 h-20 rounded-lg bg-gray-50 border shrink-0 flex items-center justify-center text-gray-300">
        <span className="text-2xl">📦</span>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.product?.name ?? 'Produk'}</p>
        <p className="text-xs text-muted-foreground">{item.variant.name}</p>
        <p className="font-bold text-primary text-sm">{formatRupiah(price)}</p>

        <div className="flex items-center justify-between pt-1">
          {/* Qty stepper */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => {
                if (item.quantity <= 1) {
                  removeItem.mutate(item.id)
                } else {
                  updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                }
              }}
              disabled={updateItem.isPending || removeItem.isPending}
              className="px-2.5 py-1.5 hover:bg-gray-50 text-sm font-bold"
            >
              −
            </button>
            <span className="px-3 py-1.5 text-sm min-w-[2rem] text-center tabular-nums">{item.quantity}</span>
            <button
              onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
              disabled={updateItem.isPending}
              className="px-2.5 py-1.5 hover:bg-gray-50 text-sm font-bold"
            >
              +
            </button>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Subtotal</p>
            <p className="font-bold text-sm">{formatRupiah(price * item.quantity)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartSkeleton() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <Skeleton className="h-7 w-48 mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 border rounded-xl p-4">
              <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </main>
  )
}
