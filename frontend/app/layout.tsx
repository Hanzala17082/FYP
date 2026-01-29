import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { generateMetadata as genMeta } from '@/shared/utils/seo'
import { ThemeProvider } from '@/shared/contexts/ThemeContext'
import { AuthProvider } from '@/shared/contexts/AuthContext'
import { ContentWrapper } from '@/shared/components/layout/ContentWrapper'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-display',
})

export const metadata: Metadata = genMeta({
  title: 'Tripster - Travel Smarter',
  description: 'Discover and book amazing trips with verified travel agencies',
  keywords: ['travel', 'trips', 'booking', 'travel agency', 'vacation'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakarta.variable} font-display antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <ContentWrapper>{children}</ContentWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
