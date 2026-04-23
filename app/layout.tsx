import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Archivo_Black } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { env } from '@/lib/env'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})
const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo-black',
})

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? 'https://ucb-bookings.vercel.app'
const title = 'UCB Bookings'
const description = 'Staff tools for confirming shows.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s · UCB Bookings',
  },
  description,
  applicationName: title,
  openGraph: {
    type: 'website',
    url: '/',
    siteName: title,
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  icons: {
    other: [
      { rel: 'icon', url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf9f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1a0a0c' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${geist.variable} ${geistMono.variable} ${archivoBlack.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
