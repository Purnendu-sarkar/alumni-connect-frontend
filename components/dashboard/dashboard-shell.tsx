'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X, Sparkles } from 'lucide-react';

import { useAuth, type UserRole } from '@/lib/hooks/use-auth';
import { roleNavigationConfig } from './navigation';
import { BottomNav } from '@/components/shared/bottom-nav';

export interface DashboardShellProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export function DashboardShell({ children, allowedRole }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // Enforce role isolation
  if (!user || (role && role !== allowedRole)) {
    router.replace('/login');
    return null;
  }

  const currentRole = (role || allowedRole) as UserRole;
  const config = roleNavigationConfig[currentRole] || roleNavigationConfig.STUDENT;
  const theme = config.theme;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AC';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href={config.navigation[0].href} className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.primaryBg} text-white font-bold text-sm shadow-xs`}
            >
              AC
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 tracking-tight text-sm md:text-base">
                AlumniConnect
              </span>
              <span
                className={`rounded-md ${theme.badgeBg} ${theme.badgeText} px-2 py-0.5 text-[11px] font-semibold hidden sm:inline-block`}
              >
                {config.title}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 pr-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${theme.badgeBg} ${theme.primaryText} font-semibold text-xs`}
            >
              {initials}
            </div>
            <div className="hidden text-left md:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">{user.role?.toLowerCase()}</div>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <button
            onClick={() => logout()}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition"
            title="Sign out of your session"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 md:block min-h-[calc(100vh-4rem)]">
          <div className={`mb-5 rounded-xl ${theme.badgeBg} p-3.5 border ${theme.accentBorder}`}>
            <div className={`flex items-center gap-2 text-xs font-semibold ${theme.badgeText}`}>
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>{config.title}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{config.subtitle}</p>
          </div>

          <nav className="space-y-1">
            {config.navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                    isActive
                      ? `${theme.primaryBg} text-white font-semibold shadow-xs`
                      : `text-slate-600 ${theme.hoverBg}`
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : `${theme.badgeBg} ${theme.badgeText}`
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden">
            <div className="fixed inset-y-0 left-0 w-72 bg-white p-4 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${theme.primaryBg} text-white font-bold text-xs`}
                    >
                      AC
                    </div>
                    <span className="font-semibold text-xs text-slate-800">{config.title}</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="mt-4 space-y-1">
                  {config.navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                          isActive
                            ? `${theme.primaryBg} text-white font-semibold shadow-xs`
                            : `text-slate-600 ${theme.hoverBg}`
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="rounded-full bg-indigo-50 text-indigo-700 px-1.5 py-0.5 text-[10px] font-bold">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        items={config.navigation.slice(0, 5).map((n) => ({
          label: n.label.split(' ')[0],
          href: n.href,
          icon: n.icon,
        }))}
      />
    </div>
  );
}
