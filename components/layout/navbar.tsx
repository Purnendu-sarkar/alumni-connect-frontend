'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { siteConfig } from '@/lib/constants/site';
import { cn } from '@/lib/utils/cn';

import { Brand } from './brand';
import { Button } from '../ui/button';

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6" aria-label="Main navigation">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                'text-sm font-medium transition-colors hover:text-blue-600',
                pathname === item.href ? 'text-blue-600 font-semibold' : 'text-slate-600',
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="h-4 w-px bg-slate-200" />
          <Link
            href="/login"
            onClick={close}
            className="text-sm font-medium text-slate-700 transition-colors hover:text-blue-600"
          >
            Sign in
          </Link>
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
            <Link href="/register" onClick={close}>
              Join now
            </Link>
          </Button>
        </nav>

        {/* Mobile menu toggle button */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown drawer */}
      {isOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50',
                )}
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-1 border-slate-100" />
            <Link
              href="/login"
              onClick={close}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/register" onClick={close}>
                Join now
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
