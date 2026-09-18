import Link from 'next/link';
import { Bell, BriefcaseBusiness, Handshake, LayoutDashboard, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';

import { Brand } from '@/components/layout/brand';
import { RequireAuth } from '@/features/auth/require-auth';
import { SignOutButton } from '@/features/auth/sign-out-button';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'My profile', icon: UserRound },
  { href: '/dashboard/connections', label: 'Connections', icon: Handshake },
  { href: '/dashboard/jobs', label: 'My jobs', icon: BriefcaseBusiness },
];

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <RequireAuth><div className="dashboard-shell"><aside className="dashboard-sidebar"><Brand /><nav>{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href}><Icon size={18} /> {label}</Link>)}</nav><Link href="/events" className="dashboard-sidebar__event"><Bell size={18} /> Homecoming / Oct 12</Link><SignOutButton /></aside><main className="dashboard-main">{children}</main></div></RequireAuth>;
}
