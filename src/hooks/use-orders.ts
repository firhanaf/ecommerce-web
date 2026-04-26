'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { orderApi, type CreateOrderInput } from '@/lib/order-api'

export function useOrders(page = 1) {
  return useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderApi.list(page),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  })
}

export function useOrderShipment(id: string) {
  return useQuery({
    queryKey: ['order-shipment', id],
    queryFn: () => orderApi.getShipment(id),
    enabled: !!id,
    retry: false,
  })
}

export function useOrderPayment(id: string) {
  return useQuery({
    queryKey: ['order-payment', id],
    queryFn: () => orderApi.getPayment(id),
    enabled: !!id,
    retry: false,
  })
}

export function useCreateOrder() {
  const router = useRouter()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrderInput) => orderApi.create(data),
    onSuccess: ({ data }) => {
      toast.success('Pesanan berhasil dibuat!')
      qc.invalidateQueries({ queryKey: ['cart'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
      router.push(`/orders/${data.data.id}`)
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? 'Gagal membuat pesanan'
      toast.error(msg)
    },
  })
}

export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orderApi.cancel(id),
    onSuccess: (_, id) => {
      toast.success('Pesanan berhasil dibatalkan')
      qc.invalidateQueries({ queryKey: ['order', id] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal membatalkan pesanan'),
  })
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (orderId: string) => orderApi.pay(orderId),
    onSuccess: ({ data }) => {
      const url = data.data.redirect_url
      if (url) window.location.href = url
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal inisiasi pembayaran'),
  })
}
