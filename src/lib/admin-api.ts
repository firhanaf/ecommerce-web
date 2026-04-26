import api from './api'
import type { ApiResponse, PaginatedResponse, User, Order, Shipment } from '@/types/api'

export interface AdminProductInput {
  name: string
  description: string
  category_id: string | null
  is_active?: boolean
  variants?: { name: string; price: number; stock: number; sku: string }[]
}

export interface AdminVariantInput {
  name: string
  price: number
  stock: number
  sku: string
  is_active?: boolean
}

export interface CreateShipmentInput {
  tracking_number: string
  courier: string
  courier_service: string
}

export const adminApi = {
  // Users
  listUsers: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<User>>('/admin/users', { params: { page, limit } }),

  updateUserStatus: (id: string, is_active: boolean) =>
    api.put<ApiResponse<null>>(`/admin/users/${id}/status`, { is_active }),

  // Categories
  createCategory: (data: { name: string; parent_id?: string | null }) =>
    api.post<ApiResponse<unknown>>('/admin/categories', data),

  updateCategory: (id: string, data: { name: string; parent_id?: string | null; is_active?: boolean }) =>
    api.put<ApiResponse<unknown>>(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete<ApiResponse<null>>(`/admin/categories/${id}`),

  // Products
  createProduct: (data: AdminProductInput) =>
    api.post<ApiResponse<unknown>>('/admin/products', data),

  updateProduct: (id: string, data: Omit<AdminProductInput, 'variants'> & { is_active: boolean }) =>
    api.put<ApiResponse<unknown>>(`/admin/products/${id}`, data),

  deleteProduct: (id: string) =>
    api.delete<ApiResponse<null>>(`/admin/products/${id}`),

  // Variants
  createVariant: (productId: string, data: AdminVariantInput) =>
    api.post<ApiResponse<unknown>>(`/admin/products/${productId}/variants`, data),

  updateVariant: (productId: string, variantId: string, data: AdminVariantInput) =>
    api.put<ApiResponse<unknown>>(`/admin/products/${productId}/variants/${variantId}`, data),

  deleteVariant: (productId: string, variantId: string) =>
    api.delete<ApiResponse<null>>(`/admin/products/${productId}/variants/${variantId}`),

  adjustStock: (productId: string, variantId: string, stock: number) =>
    api.put<ApiResponse<unknown>>(`/admin/products/${productId}/variants/${variantId}/stock`, { stock }),

  // Images
  uploadImage: (productId: string, file: File, isPrimary: boolean) => {
    const form = new FormData()
    form.append('image', file)
    form.append('is_primary', String(isPrimary))
    // Jangan set Content-Type manual — axios otomatis tambahkan boundary yang benar
    return api.post<ApiResponse<unknown>>(`/admin/products/${productId}/images`, form)
  },

  deleteImage: (productId: string, imageId: string) =>
    api.delete<ApiResponse<null>>(`/admin/products/${productId}/images/${imageId}`),

  // Orders
  listOrders: (page = 1, limit = 20, status?: string) =>
    api.get<PaginatedResponse<Order>>('/admin/orders', { params: { page, limit, status: status || undefined } }),

  updateOrderStatus: (id: string, status: string) =>
    api.put<ApiResponse<null>>(`/admin/orders/${id}/status`, { status }),

  createShipment: (orderId: string, data: CreateShipmentInput) =>
    api.post<ApiResponse<Shipment>>(`/admin/orders/${orderId}/shipment`, data),

  updateShipmentStatus: (orderId: string, status: string) =>
    api.put<ApiResponse<Shipment>>(`/admin/orders/${orderId}/shipment`, { status }),

  // Audit logs
  listAuditLogs: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<unknown>>('/admin/audit-logs', { params: { page, limit } }),
}
