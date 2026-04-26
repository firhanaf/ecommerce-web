'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cartApi } from '@/lib/cart-api'
import { useCartStore } from '@/store/cart-store'
import { useAuthStore } from '@/store/auth-store'
import { useEffect } from 'react'

export function useCart() {
  const { user } = useAuthStore()
  const { setCart } = useCartStore()

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
    enabled: !!user,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (query.data?.data?.data?.items) {
      setCart(query.data.data.data.items)
    }
  }, [query.data, setCart])

  return query
}

export function useAddToCart() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ variant_id, quantity }: { variant_id: string; quantity: number }) =>
      cartApi.addItem(variant_id, quantity),
    onSuccess: () => {
      toast.success('Produk ditambahkan ke keranjang')
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Gagal menambahkan ke keranjang'
      toast.error(msg)
    },
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Gagal update keranjang'
      toast.error(msg)
    },
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      toast.success('Produk dihapus dari keranjang')
      qc.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? 'Gagal menghapus dari keranjang'
      toast.error(msg)
    },
  })
}
