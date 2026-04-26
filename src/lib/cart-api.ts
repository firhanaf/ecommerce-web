import api from './api'
import type { ApiResponse, Cart } from '@/types/api'

export const cartApi = {
  get: () => api.get<ApiResponse<Cart>>('/cart'),

  addItem: (variant_id: string, quantity: number) =>
    api.post<ApiResponse<Cart>>('/cart/items', { variant_id, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`),
}
