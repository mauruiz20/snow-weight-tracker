import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { LavaBlobs, SnowAnimation, ThemeToggle } from '@/components/ui'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Snow Weight Tracker - Chile 2026 🏂',
  description:
    'Ponte en forma para el viaje de snowboard a Chile en agosto 2026. Registra tu peso y compite con amigos.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LavaBlobs />
        <SnowAnimation />
        <header className="fixed right-2 top-2 z-50 sm:right-4 sm:top-4">
          <ThemeToggle />
        </header>
        {children}
      </body>
    </html>
  )
}
