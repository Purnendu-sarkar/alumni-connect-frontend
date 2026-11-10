'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { refreshSession } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

export function RequireAuth({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const [checking, setChecking] = useState(!user);

  useEffect(() => {
    if (user) {
      setChecking(false);
      return;
    }
    refreshSession()
      .then((response) => {
        if (response.data) setSession(response.data);
        else router.replace('/login');
      })
      .catch(() => router.replace('/login'))
      .finally(() => setChecking(false));
  }, [router, setSession, user]);

  useEffect(() => {
    if (!user || checking) return;

    const role = user.role;

    if (pathname.startsWith('/dashboard/super-admin') || pathname.startsWith('/dashboard/admin')) {
      if (role !== 'SUPER_ADMIN') {
        router.replace('/dashboard');
      }
    } else if (pathname.startsWith('/dashboard/moderator')) {
      if (role !== 'MODERATOR' && role !== 'SUPER_ADMIN') {
        router.replace('/dashboard');
      }
    } else if (pathname.startsWith('/dashboard/student')) {
      if (role !== 'STUDENT' && role !== 'SUPER_ADMIN') {
        router.replace('/dashboard');
      }
    } else if (pathname.startsWith('/dashboard/alumni')) {
      if (role !== 'ALUMNI' && role !== 'SUPER_ADMIN') {
        router.replace('/dashboard');
      }
    }
  }, [user, checking, pathname, router]);

  if (checking || !user) {
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
