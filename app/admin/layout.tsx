'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  UserCheck,
  Users,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Bell,
  Lock,
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/use-auth';
import { BottomNav, type BottomNavItem } from '@/components/shared/bottom-nav';

const navItems: BottomNavItem[] = [
  { label: 'Console', href: '/admin/dashboard', icon: ShieldCheck },
  { label: 'Verify', href: '/admin/users/verification', icon: UserCheck },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { label: 'Audit', href: '/admin/audit-logs', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading Super Admin Console…</p>
        </div>
      </div>
    );
  }

  if (!user || role !== 'SUPER_ADMIN') {
    router.replace('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-xs">
              AC
            </div>
            <div>
              <span className="font-semibold text-slate-900 tracking-tight">AlumniConnect</span>
              <span className="ml-2 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                Super Admin
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-semibold text-xs text-indigo-800">
              SA
            </div>
            <span className="hidden text-xs font-medium text-slate-700 md:inline-block">
              {user.name}
            </span>
          </div>
          <button
            onClick={() => logout()}
            className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 md:block min-h-[calc(100vh-4rem)]">
          <div className="mb-4 rounded-xl bg-indigo-50/60 p-3.5 border border-indigo-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
              <Lock className="h-3.5 w-3.5 text-indigo-600" />
              <span>Root Governance</span>
            </div>
            <p className="mt-1 text-[11px] text-indigo-700 leading-relaxed">
              Platform administration, institutional security, and append-only audit tracking.
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>

      <BottomNav items={navItems} activeColorClass="text-indigo-600" />
    </div>
  );
}

