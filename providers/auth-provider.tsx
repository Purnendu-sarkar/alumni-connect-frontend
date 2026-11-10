'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import { refreshSession } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const setSession = useAuthStore((state) => state.setSession);
  const markInitialized = useAuthStore((state) => state.markInitialized);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initialCheckStarted = useRef(false);

  useEffect(() => {
    if (isInitialized || initialCheckStarted.current) return;
    initialCheckStarted.current = true;

    let active = true;
    refreshSession()
      .then((response) => {
        if (active && response.data) {
          setSession(response.data);
        } else if (active) {
          markInitialized();
        }
      })
      .catch(() => {
        if (active) {
          markInitialized();
        }
      });

    return () => {
      active = false;
    };
  }, [isInitialized, markInitialized, setSession]);

  return children;
}
