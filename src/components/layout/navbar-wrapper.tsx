'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './navbar'

const HIDDEN_PATHS = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password', '/admin']

export function NavbarWrapper() {
  const pathname = usePathname()
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null
  return <Navbar />
}
