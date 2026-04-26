import api from './api'
import type { ApiResponse, PaginatedResponse, Product, Category } from '@/types/api'

export interface ProductFilter {
  search?: string
  category_id?: string
  page?: number
  limit?: number
}

export const productApi = {
  list: (filter: ProductFilter = {}) =>
    api.get<PaginatedResponse<Product>>('/products', { params: filter }),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<Product>>(`/products/${slug}`),

  listCategories: () =>
    api.get<ApiResponse<Category[]>>('/categories'),
}
