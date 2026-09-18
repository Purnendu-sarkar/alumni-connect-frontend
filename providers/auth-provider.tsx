'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { refreshSession } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  useEffect(() => {
    let active = true;
    refreshSession().then((response) => { if (active && response.data) setSession(response.data); }).catch(() => { if (active) clearSession(); });
    return () => { active = false; };
  }, [clearSession, setSession]);
  return children;
}
