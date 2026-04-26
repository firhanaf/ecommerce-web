export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  code: number
  message: string
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'buyer' | 'admin'
  avatar_url: string
  is_active: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  user: User
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  is_active: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string
  price: number
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  category_id: string
  is_active: boolean
  variants: ProductVariant[]
  images: ProductImage[]
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  recipient_name: string
  phone: string
  street: string
  city: string
  province: string
  postal_code: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  variant_id: string
  quantity: number
  created_at: string
  updated_at: string
  variant: ProductVariant & { product_id: string }
  product: { id: string; name: string }
}

export interface Cart {
  id: string
  user_id: string
  items: CartItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  variant_id: string | null
  product_name: string
  variant_name: string
  product_image: string
  quantity: number
  unit_price: number
  subtotal: number
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  total: number
  courier: string
  courier_service: string
  notes: string
  snapshot_address: Address
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export type PaymentStatus =
  | 'pending'
  | 'settlement'
  | 'cancel'
  | 'expire'
  | 'refund'
  | 'failed'

export interface Payment {
  id: string
  order_id: string
  provider: string
  payment_method: string
  status: PaymentStatus
  transaction_id: string
  amount: number
  paid_at: string | null
  expired_at: string | null
  created_at: string
}

export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'returned'

export interface Shipment {
  id: string
  order_id: string
  courier: string
  courier_service: string
  tracking_number: string
  status: ShipmentStatus
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
}
