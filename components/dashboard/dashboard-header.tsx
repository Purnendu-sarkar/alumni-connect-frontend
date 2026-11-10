'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Sparkles,
  User,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/api/auth.api';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';
import { demoNotifications } from '@/features/shared/demo-data';

interface DashboardHeaderProps {
  onToggleMobileMenu?: () => void;
  role?: UserRole;
  className?: string;
}

export function DashboardHeader({ onToggleMobileMenu, role, className }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(demoNotifications);

  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Generate breadcrumb pieces
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const label = part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return { href, label, isLast: index === pathParts.length - 1 };
  });

  // Handle outside click to close popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const base = role ? `/${role.toLowerCase().replace('_', '-')}` : '/dashboard';
    router.push(`${base}/directory?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Continue client cleanup even if network fails
    }
    clearSession();
    router.replace('/login');
  };

  const rolePrefix =
    user?.role === 'SUPER_ADMIN'
      ? '/admin'
      : user?.role === 'MODERATOR'
      ? '/moderator'
      : user?.role === 'ALUMNI'
      ? '/alumni'
      : '/student';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between gap-4 h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs',
        className,
      )}
    >
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden">
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.href} className="flex items-center gap-1.5 truncate">
              {idx > 0 ? <span className="text-slate-300">/</span> : null}
              {crumb.isLast ? (
                <span className="font-bold text-slate-800 truncate">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-slate-800 transition-colors truncate">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Center: Search input */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-sm w-full relative">
        <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search directory, jobs, notices…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </form>

      {/* Right: Actions, Notifications & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notification Bell Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 ? (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {showNotifications ? (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-0 overflow-hidden animate-in fade-in duration-150 z-50">
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 m-0">Notifications</h4>
                  {unreadCount > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {unreadCount} new
                    </span>
                  ) : null}
                </div>
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    <Check size={12} /> Mark read
                  </button>
                ) : null}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">No notifications at this time.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'p-3 text-xs transition-colors hover:bg-slate-50 flex flex-col gap-1',
                        !notif.isRead && 'bg-blue-50/40',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-slate-900 font-semibold">{notif.title}</strong>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.createdAt}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] m-0 line-clamp-2">{notif.message}</p>
                      {notif.link ? (
                        <Link
                          href={notif.link}
                          onClick={() => setShowNotifications(false)}
                          className="text-[11px] font-semibold text-blue-600 hover:underline mt-1"
                        >
                          View details →
                        </Link>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 text-center bg-slate-50">
                <Link
                  href={`${rolePrefix}/notifications`}
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors block py-1"
                >
                  View all notification history
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        {/* User Profile Dropdown */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
            aria-label="User account menu"
          >
            <Avatar name={user?.name || 'User'} src={user?.avatarUrl} />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 truncate max-w-[120px] m-0 leading-tight">
                {user?.name?.split(' ')[0] || 'Account'}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider m-0">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
          </button>

          {showUserMenu ? (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 overflow-hidden animate-in fade-in duration-150 z-50">
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate m-0">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate m-0">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href={`${rolePrefix}/profile`}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <User size={15} className="text-slate-400" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href={`${rolePrefix}/settings`}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Settings size={15} className="text-slate-400" />
                  <span>Account Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
