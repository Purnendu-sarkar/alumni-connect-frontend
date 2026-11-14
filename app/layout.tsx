import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { Providers } from '@/providers/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://alumniconnect.example'),
  title: {
    default: 'AlumniConnect — Academic Networking Platform',
    template: '%s | AlumniConnect',
  },
  description: 'The verified professional networking platform for your university community.',
  applicationName: 'AlumniConnect',
  keywords: ['alumni', 'mentorship', 'jobs', 'university network', 'higher education'],
  openGraph: {
    type: 'website',
    siteName: 'AlumniConnect',
    title: 'AlumniConnect',
    description: 'Find mentors, career opportunities, and your university network.',
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
