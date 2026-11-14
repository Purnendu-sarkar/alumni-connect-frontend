'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { X } from 'lucide-react';

import { RequireAuth } from '@/features/auth/require-auth';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';
import { DashboardHeader } from './dashboard-header';
import { DashboardSidebar } from './dashboard-sidebar';

interface DashboardShellProps {
  requiredRole?: UserRole;
  children: ReactNode;
}

export function DashboardShell({ requiredRole, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role validation & guard
  useEffect(() => {
    if (!user) return;

    // Enforce mandatory password update
    if (user.needPasswordChange) {
      const securityPath =
        user.role === 'SUPER_ADMIN'
          ? '/admin/settings/security'
          : user.role === 'MODERATOR'
          ? '/moderator/settings/security'
          : user.role === 'ALUMNI'
          ? '/alumni/settings/security'
          : '/student/settings/security';

      if (pathname !== securityPath) {
        router.replace(securityPath);
        return;
      }
    }

    if (requiredRole && user.role !== requiredRole) {
      // Strict role isolation per Master Specification
      switch (user.role) {
        case 'STUDENT':
          router.replace('/student/dashboard');
          break;
        case 'ALUMNI':
          router.replace('/alumni/dashboard');
          break;
        case 'MODERATOR':
          router.replace('/moderator/dashboard');
          break;
        case 'SUPER_ADMIN':
          router.replace('/admin/dashboard');
          break;
        default:
          router.replace('/login');
      }
    }
  }, [user, requiredRole, router, pathname]);

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <RequireAuth>
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased">
        {/* Desktop Sidebar (hidden on mobile, fixed width on md+) */}
        <div className="hidden md:flex md:flex-col md:h-full md:shrink-0">
          <DashboardSidebar role={requiredRole || user?.role} />
        </div>

        {/* Mobile Slide-over Drawer Backdrop */}
        {mobileMenuOpen ? (
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-3 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Close navigation drawer"
              >
                <X size={20} />
              </button>
              <DashboardSidebar
                role={requiredRole || user?.role}
                onNavigate={() => setMobileMenuOpen(false)}
                className="w-full border-r-0"
              />
            </div>
          </div>
        ) : null}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <DashboardHeader
            role={requiredRole || user?.role}
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
