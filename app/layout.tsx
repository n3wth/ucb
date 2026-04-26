import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { env } from '@/lib/env'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const sohne = localFont({
  variable: '--font-sohne',
  display: 'swap',
  src: [
    { path: '../public/fonts/Sohne-Buch.woff2',            weight: '400', style: 'normal' },
    { path: '../public/fonts/Sohne-BuchKursiv.woff2',      weight: '400', style: 'italic' },
    { path: '../public/fonts/Sohne-Kraftig.woff2',         weight: '500', style: 'normal' },
    { path: '../public/fonts/Sohne-Halbfett.woff2',        weight: '600', style: 'normal' },
    { path: '../public/fonts/Sohne-Dreiviertelfett.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/Sohne-Fett.woff2',            weight: '800', style: 'normal' },
  ],
})

const dahlia = localFont({
  variable: '--font-dahlia',
  display: 'swap',
  src: [
    { path: '../public/fonts/Dahlia-Medium.woff2', weight: '500', style: 'normal' },
  ],
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
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
    locale: 'en_US',
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
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-icon',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2b2c30' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2024' },
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
      suppressHydrationWarning
      className={`bg-background ${sohne.variable} ${dahlia.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased [font-synthesis-weight:none]">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={['light', 'dark', 'gay']}
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
