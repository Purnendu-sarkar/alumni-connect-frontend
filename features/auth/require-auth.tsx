'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { refreshSession } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

export function RequireAuth({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const [checking, setChecking] = useState(!user);
  useEffect(() => {
    if (user) { setChecking(false); return; }
    refreshSession().then((response) => { if (response.data) setSession(response.data); else router.replace('/login'); }).catch(() => router.replace('/login')).finally(() => setChecking(false));
  }, [router, setSession, user]);
  if (checking || !user) return <main className="loading-screen" aria-live="polite"><div className="page-shell"><p className="eyebrow">CHECKING SESSION</p><div className="loading-rule" /></div></main>;
  return children;
}
