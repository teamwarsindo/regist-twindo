import type { Metadata } from 'next'

// Tautan Discord Anda
const DISCORD_LINK = "https://discord.gg/NtBBdqUrxe"

export const metadata: Metadata = {
  title: 'Team Wars Indonesia',
  description: 'Official Discord - Masuk ke server Discord resmi Team Wars Indonesia untuk mencari tim, bertanya ke panitia, dan mendapatkan info terbaru.',
  openGraph: {
    title: 'Team Wars Indonesia',
    description: 'Official Discord - Masuk ke server Discord resmi Team Wars Indonesia untuk mencari tim, bertanya ke panitia, dan mendapatkan info terbaru.',
    images: [
      {
        url: '/opengraph-image.jpg', // Logo Anda akan muncul di sini!
        width: 1200,
        height: 630,
        alt: 'Team Wars Indonesia Discord',
      },
    ],
  },
}

export default function InvitePage() {
  return (
    <html lang="id">
      <head>
        {/* Trik Meta Refresh: Mengalihkan pengunjung asli (manusia) ke Discord secara instan dalam 0 detik */}
        <meta httpEquiv="refresh" content={`0;url=${DISCORD_LINK}`} />
      </head>
      <body className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-xl font-bold">Mengalihkan ke Discord...</h1>
          <p className="mt-2 text-sm text-slate-400">
            Jika tidak dialihkan secara otomatis,{' '}
            <a href={DISCORD_LINK} className="text-blue-400 underline hover:text-blue-300">
              klik di sini
            </a>.
          </p>
        </div>
      </body>
    </html>
  )
}
