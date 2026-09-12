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
    <header className="site-header">
      <div className="site-header__inner">
        <Brand />
        <button className="menu-toggle" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-label="Toggle navigation">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={cn('site-nav', isOpen && 'site-nav--open')} aria-label="Main navigation">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={close} className={cn('site-nav__link', pathname === item.href && 'site-nav__link--active')}>
              {item.label}
            </Link>
          ))}
          <Link href="/login" onClick={close} className="site-nav__link">Sign in</Link>
          <Button asChild size="sm"><Link href="/register" onClick={close}>Join now</Link></Button>
        </nav>
      </div>
    </header>
  );
}
