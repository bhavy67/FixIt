import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';
import { CommandPalette } from '@/components/tools/command-palette';
import { siteConfig } from '@/lib/site-config';
import '../styles/globals.css';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fixit.local';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ['file utility', 'pdf', 'image', 'json', 'local-first', 'privacy'],
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body suppressHydrationWarning className="bg-background text-foreground min-h-dvh antialiased">
        <a
          href="#main"
          className="bg-primary text-primary-foreground focus-visible:ring-ring sr-only rounded-md px-3 py-2 text-sm font-medium focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:ring-2 focus-visible:outline-none"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <div id="main" className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
          <Toaster />
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
