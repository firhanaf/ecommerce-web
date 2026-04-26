import api from './api'
import type { ApiResponse, PaginatedResponse, Order, Shipment, Payment } from '@/types/api'

export interface CreateOrderInput {
  address_id: string
  courier: string
  courier_service: string
  notes?: string
  shipping_cost: number
}

export const orderApi = {
  create: (data: CreateOrderInput) =>
    api.post<ApiResponse<Order>>('/orders', data),

  list: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Order>>('/orders', { params: { page, limit } }),

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`),

  cancel: (id: string) =>
    api.post<ApiResponse<null>>(`/orders/${id}/cancel`, {}),

  getShipment: (id: string) =>
    api.get<ApiResponse<Shipment>>(`/orders/${id}/shipment`),

  getPayment: (id: string) =>
    api.get<ApiResponse<Payment>>(`/orders/${id}/payment`),

  pay: (id: string) =>
    api.post<ApiResponse<{ snap_token: string; redirect_url: string }>>(`/orders/${id}/pay`, {}),
}
