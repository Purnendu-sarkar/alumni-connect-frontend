'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Briefcase,
  Handshake,
  User,
  LogOut,
  Bell,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '@/lib/hooks/use-auth';
import { BottomNav, type BottomNavItem } from '@/components/shared/bottom-nav';

const navItems: BottomNavItem[] = [
  { label: 'Desk', href: '/student/dashboard', icon: GraduationCap },
  { label: 'Directory', href: '/student/directory', icon: Users },
  { label: 'Network', href: '/student/connections', icon: Handshake },
  { label: 'Jobs', href: '/student/jobs', icon: Briefcase },
  { label: 'Profile', href: '/student/profile', icon: User },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading Student Desk…</p>
        </div>
      </div>
    );
  }

  if (!user || (role && role !== 'STUDENT')) {
    router.replace('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-3">
          <Link href="/student/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-xs">
              AC
            </div>
            <div>
              <span className="font-semibold text-slate-900 tracking-tight">AlumniConnect</span>
              <span className="ml-2 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                Student Desk
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-xs text-blue-800">
              {user.name.slice(0, 2).toUpperCase()}
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
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 md:block min-h-[calc(100vh-4rem)]">
          <div className="mb-4 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Academic Network</span>
            </div>
            <p className="mt-1 text-[11px] text-blue-700 leading-relaxed">
              Connect directly with verified alumni for career mentorship & job referrals.
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href !== '/student/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
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

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>

      {/* Persistent Mobile Bottom Navigation */}
      <BottomNav items={navItems} activeColorClass="text-blue-600" />
    </div>
  );
}

