import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '../components/theme/theme-provider'
import { ToastProvider } from '../components/ui/toast'
import { TooltipProvider } from '../components/ui/tooltip'
import { ErrorSetup } from '../components/error-setup'
import { ClerkAuthProvider } from '../lib/auth/clerk-context'
import { AutoSyncProfile } from '../components/auth/auto-sync-profile'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Evo Lead AI - AI-Powered Lead Generation Platform | Find Quality Business Leads',
  description:
    'Transform your sales with Evo Lead AI. Generate verified business leads using advanced AI, collaborate with your team in multi-tenant organizations, and scale your outreach with confidence scores. Start free trial - 2 searches included.',
  keywords: [
    'lead generation',
    'AI lead generation',
    'business leads',
    'sales leads',
    'B2B leads',
    'SaaS',
    'multi-tenant',
    'organization management',
    'Pakistan lead generation',
    'verified business contacts',
    'sales automation',
    'CRM integration',
    'export leads CSV',
    'team collaboration',
    'confidence scoring'
  ],
  authors: [{ name: 'Evo Lead AI' }],
  creator: 'Evo Lead AI',
  publisher: 'Evo Lead AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://evoleadai.com',
    title: 'Evo Lead AI - AI-Powered Lead Generation Platform',
    description:
      'Generate verified business leads with AI-powered search. Multi-tenant collaboration, confidence scores, and seamless exports. Start your free trial today.',
    siteName: 'Evo Lead AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Evo Lead AI - AI-Powered Lead Generation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evo Lead AI - AI-Powered Lead Generation Platform',
    description:
      'Generate verified business leads with AI-powered search. Multi-tenant collaboration, confidence scores, and seamless exports.',
    images: ['/og-image.png'],
    creator: '@evoleadai',
  },
  alternates: {
    canonical: 'https://evoleadai.com',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        >
          <ThemeProvider
            defaultTheme="system"
            storageKey="evo-lead-ai-theme"
          >
            <TooltipProvider>
              <ToastProvider>
                <ErrorSetup />
                <AutoSyncProfile />
                <ClerkAuthProvider>
                  {children}
                </ClerkAuthProvider>
              </ToastProvider>
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
