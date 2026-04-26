import api from './api'
import type { ApiResponse, Address } from '@/types/api'

export interface AddressInput {
  recipient_name: string
  phone: string
  street: string
  city: string
  province: string
  postal_code: string
  is_default?: boolean
}

export const addressApi = {
  list: () => api.get<ApiResponse<Address[]>>('/addresses'),

  create: (data: AddressInput) =>
    api.post<ApiResponse<Address>>('/addresses', data),

  update: (id: string, data: Partial<AddressInput>) =>
    api.put<ApiResponse<Address>>(`/addresses/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/addresses/${id}`),

  setDefault: (id: string) =>
    api.put<ApiResponse<null>>(`/addresses/${id}/default`, {}),
}
