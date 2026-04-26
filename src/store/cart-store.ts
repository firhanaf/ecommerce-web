import { create } from 'zustand'
import type { CartItem } from '@/types/api'

interface CartState {
  items: CartItem[]
  totalItems: number
  setCart: (items: CartItem[]) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalItems: 0,

  setCart: (items) =>
    set({
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    }),

  clearCart: () => set({ items: [], totalItems: 0 }),
}))
