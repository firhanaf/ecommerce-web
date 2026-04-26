'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { addressApi, type AddressInput } from '@/lib/address-api'

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list(),
    staleTime: 60_000,
  })
}

export function useCreateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AddressInput) => addressApi.create(data),
    onSuccess: () => { toast.success('Alamat berhasil ditambahkan'); qc.invalidateQueries({ queryKey: ['addresses'] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal menambahkan alamat'),
  })
}

export function useUpdateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddressInput> }) => addressApi.update(id, data),
    onSuccess: () => { toast.success('Alamat berhasil diperbarui'); qc.invalidateQueries({ queryKey: ['addresses'] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal memperbarui alamat'),
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => addressApi.delete(id),
    onSuccess: () => { toast.success('Alamat berhasil dihapus'); qc.invalidateQueries({ queryKey: ['addresses'] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal menghapus alamat'),
  })
}

export function useSetDefaultAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => addressApi.setDefault(id),
    onSuccess: () => { toast.success('Alamat default diperbarui'); qc.invalidateQueries({ queryKey: ['addresses'] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal mengubah alamat default'),
  })
}
