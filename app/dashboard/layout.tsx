'use client';

import Link from 'next/link';
import { BriefcaseBusiness, Handshake, LayoutDashboard, ShieldCheck, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';

import { Brand } from '@/components/layout/brand';
import { RequireAuth } from '@/features/auth/require-auth';
import { SignOutButton } from '@/features/auth/sign-out-button';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = useAuthStore((state) => state.user);
  const isStaff = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR';

  const links = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'My profile', icon: UserRound },
    { href: '/dashboard/connections', label: 'Connections', icon: Handshake },
    { href: '/dashboard/jobs', label: 'My jobs', icon: BriefcaseBusiness },
    ...(isStaff ? [{ href: '/admin/verification', label: 'Verification queue', icon: ShieldCheck }] : []),
  ];

  return (
    <RequireAuth>
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <Brand />
          <nav>
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Icon size={18} /> {label}
              </Link>
            ))}
          </nav>
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <SignOutButton />
          </div>
        </aside>
        <main className="dashboard-main">{children}</main>
      </div>
    </RequireAuth>
  );
}
