import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'FixIt — Drop it. Fix it. Done.',
    template: '%s · FixIt',
  },
  description:
    'A local-first browser utility for annoying file operations. Compress PDFs, resize images, format JSON — all in your browser, nothing uploaded.',
  applicationName: 'FixIt',
  keywords: ['file utility', 'pdf', 'image', 'json', 'local-first', 'privacy'],
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-background text-foreground min-h-dvh antialiased">{children}</body>
    </html>
  );
}
