'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useAuthStore } from '@/store/auth-store';

export function RequireAuth({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);

  useEffect(() => {
    if (!isInitialized) return;

    if (!user || isLoggingOut) {
      router.replace('/login');
    }
  }, [isInitialized, isLoggingOut, router, user]);

  useEffect(() => {
    if (!user || !isInitialized || isLoggingOut) return;

    const role = user.role;

    // Enforce mandatory password update if needPasswordChange is active
    if (user.needPasswordChange) {
      const securityPath =
        role === 'SUPER_ADMIN'
          ? '/admin/settings/security'
          : role === 'MODERATOR'
          ? '/moderator/settings/security'
          : role === 'ALUMNI'
          ? '/alumni/settings/security'
          : '/student/settings/security';

      if (pathname !== securityPath) {
        router.replace(securityPath);
        return;
      }
    }

    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/dashboard/super-admin') ||
      pathname.startsWith('/dashboard/admin')
    ) {
      if (role !== 'SUPER_ADMIN') {
        router.replace('/dashboard');
      }
    } else if (
      pathname.startsWith('/moderator') ||
      pathname.startsWith('/dashboard/moderator')
    ) {
      if (role !== 'MODERATOR') {
        router.replace('/dashboard');
      }
    } else if (
      pathname.startsWith('/student') ||
      pathname.startsWith('/dashboard/student')
    ) {
      if (role !== 'STUDENT') {
        router.replace('/dashboard');
      }
    } else if (
      pathname.startsWith('/alumni') ||
      pathname.startsWith('/dashboard/alumni')
    ) {
      if (role !== 'ALUMNI') {
        router.replace('/dashboard');
      }
    }
  }, [user, isInitialized, isLoggingOut, pathname, router]);

  if (!isInitialized || !user || isLoggingOut) {
    return (
      <main className="loading-screen" aria-live="polite">
        <div className="page-shell">
          <p className="eyebrow">CHECKING SESSION</p>
          <div className="loading-rule" />
        </div>
      </main>
    );
  }

  return children;
}
