import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Providers } from '@/lib/providers'
import { NavbarWrapper } from '@/components/layout/navbar-wrapper'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: { default: 'Toko', template: '%s | Toko' },
  description: 'Belanja online mudah dan aman',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={geist.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <NavbarWrapper />
          {children}
        </Providers>
      </body>
    </html>
  )
}
