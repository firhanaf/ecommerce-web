import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/products', '/login', '/register', '/verify-otp', '/forgot-password', '/reset-password']
const BUYER_PATHS = ['/cart', '/checkout', '/orders', '/profile']
const ADMIN_PATHS = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ambil auth state dari cookie yang di-set saat login
  const isAuthenticated = request.cookies.has('auth_user')
  const role = request.cookies.get('auth_role')?.value

  const isBuyerPath = BUYER_PATHS.some((p) => pathname.startsWith(p))
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p))

  // Buyer route: harus login
  if (isBuyerPath && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
  }

  // Admin route: harus login + role admin
  if (isAdminPath) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Sudah login, jangan bisa akses auth pages lagi
  if (isAuthenticated && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
