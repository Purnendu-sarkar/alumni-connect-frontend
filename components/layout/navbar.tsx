'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { siteConfig, getRoleWorkspaceConfig } from '@/lib/constants/site';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/store/auth-store';
import { logout } from '@/lib/api/auth.api';

import { Brand } from './brand';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const startLogout = useAuthStore((state) => state.startLogout);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = () => setIsOpen(false);

  const isAuthenticated = mounted && isInitialized && Boolean(user);
  const roleConfig = user ? getRoleWorkspaceConfig(user.role) : null;
  const navItems = isAuthenticated && roleConfig ? roleConfig.navLinks : siteConfig.navigation;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    startLogout();
    try {
      await logout();
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      clearSession();
      queryClient.clear();
      router.replace('/login');
    }
  };

  const getRoleBadgeClasses = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MODERATOR':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ALUMNI':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Brand />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-2.5">
          {isAuthenticated && user && roleConfig ? (
            <>
              <Button asChild size="sm" className="font-semibold shadow-xs">
                <Link href={roleConfig.dashboardHref} className="inline-flex items-center gap-1.5">
                  {roleConfig.dashboardLabel}
                  <ArrowRight size={14} />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    aria-label="User account menu"
                  >
                    <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                    <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate hidden xl:inline-block">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={13} className="text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-xl">
                  <DropdownMenuLabel className="font-normal p-2.5">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{user.name}</p>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border',
                            getRoleBadgeClasses(user.role),
                          )}
                        >
                          {roleConfig.roleLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={roleConfig.dashboardHref} className="flex items-center gap-2 w-full cursor-pointer">
                      <LayoutDashboard size={14} className="text-slate-400" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={roleConfig.profileHref} className="flex items-center gap-2 w-full cursor-pointer">
                      <User size={14} className="text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={roleConfig.settingsHref} className="flex items-center gap-2 w-full cursor-pointer">
                      <Settings size={14} className="text-slate-400" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Sign in
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Join Network</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {isAuthenticated && user && roleConfig && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar name={user.name} src={user.avatarUrl} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border shrink-0',
                  getRoleBadgeClasses(user.role),
                )}
              >
                {roleConfig.roleLabel}
              </span>
            </div>
          )}

          <div className="space-y-1 pb-2 border-b border-slate-100">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-1 flex flex-col gap-2">
            {isAuthenticated && user && roleConfig ? (
              <>
                <Button asChild size="default" className="w-full justify-center">
                  <Link href={roleConfig.dashboardHref} onClick={close}>
                    {roleConfig.dashboardLabel}
                    <ArrowRight size={14} className="ml-1.5" />
                  </Link>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={roleConfig.profileHref}
                    onClick={close}
                    className="text-center py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <User size={13} /> Profile
                  </Link>
                  <Link
                    href={roleConfig.settingsHref}
                    onClick={close}
                    className="text-center py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Settings size={13} /> Settings
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    close();
                    handleLogout();
                  }}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200"
                >
                  Sign in
                </Link>
                <Button asChild size="default" className="w-full justify-center">
                  <Link href="/register" onClick={close}>
                    Join Network
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
