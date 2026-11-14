'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import { refreshSession } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initialCheckStarted = useRef(false);

  useEffect(() => {
    if (isInitialized || initialCheckStarted.current) return;
    initialCheckStarted.current = true;

    // Safety timeout: guarantee the app never hangs indefinitely on "CHECKING SESSION"
    const safetyTimeoutId = setTimeout(() => {
      const state = useAuthStore.getState();
      if (!state.isInitialized) {
        state.clearSession();
      }
    }, 6000);

    refreshSession()
      .then((response) => {
        clearTimeout(safetyTimeoutId);
        if (response?.data?.accessToken && response?.data?.user) {
          setSession(response.data);
        } else {
          clearSession();
        }
      })
      .catch(() => {
        clearTimeout(safetyTimeoutId);
        clearSession();
      });

    return () => {
      clearTimeout(safetyTimeoutId);
    };
  }, [isInitialized, clearSession, setSession]);

  return children;
}
