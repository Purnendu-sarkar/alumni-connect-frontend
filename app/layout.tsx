import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import '@fontsource/archivo-black/400.css';
import '@fontsource/work-sans/400.css';
import '@fontsource/work-sans/500.css';
import '@fontsource/work-sans/600.css';
import '@fontsource/work-sans/700.css';

import { Providers } from '@/providers/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://alumniconnect.example'),
  title: {
    default: 'AlumniConnect — Your network, in print.',
    template: '%s | AlumniConnect',
  },
  description: 'The verified professional network for your university community.',
  applicationName: 'AlumniConnect',
  keywords: ['alumni', 'mentorship', 'jobs', 'university network'],
  openGraph: {
    type: 'website',
    siteName: 'AlumniConnect',
    title: 'AlumniConnect',
    description: 'Find mentors, opportunities, and your university network.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
