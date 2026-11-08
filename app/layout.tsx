import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { Providers } from '@/providers/providers';
import '@/styles/globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL('https://alumniconnect.edu'),
  title: {
    default: 'AlumniConnect — Institutional Networking Platform',
    template: '%s | AlumniConnect',
  },
  description: 'The verified single-university professional networking platform for students and alumni.',
  applicationName: 'AlumniConnect',
  keywords: ['alumni', 'mentorship', 'jobs', 'university network', 'career'],
  openGraph: {
    type: 'website',
    siteName: 'AlumniConnect',
    title: 'AlumniConnect',
    description: 'Find mentors, opportunities, and build enduring institutional connections.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1F3A',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
