import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development'

const nextConfig: NextConfig = {
  images: {
    // Di dev pakai local storage (localhost) — Next.js blokir loopback IP saat optimasi.
    // unoptimized: true berarti <Image> langsung pakai URL src tanpa proxy optimizer.
    // Di production (S3/R2) set ke false agar optimasi aktif kembali.
    unoptimized: isDev,
    remotePatterns: [
      // AWS S3 / Cloudflare R2 / Backblaze (production)
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.backblazeb2.com' },
    ],
  },
};

export default nextConfig;
