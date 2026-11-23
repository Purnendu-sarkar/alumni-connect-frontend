import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { Providers } from '@/providers/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://alumniconnect.example'),
  title: {
    default: 'Alumni Connect — North Western University',
    template: '%s | Alumni Connect',
  },
  description: 'The official verified alumni networking, mentorship, and career portal for North Western University.',
  applicationName: 'Alumni Connect',
  keywords: ['alumni', 'mentorship', 'jobs', 'university network', 'North Western University', 'NWU'],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'Alumni Connect — North Western University',
    title: 'Alumni Connect — North Western University',
    description: 'Find mentors, career opportunities, and your university network at North Western University.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1F3A',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
