import { create } from 'zustand';

import type { SessionUser } from '@/types/domain';

interface AuthState {
  accessToken: string | null;
  user: SessionUser | null;
  isInitialized: boolean;
  isLoggingOut: boolean;
  setSession: (session: { accessToken: string; user: SessionUser }) => void;
  updateUser: (partial: Partial<SessionUser>) => void;
  clearSession: () => void;
  startLogout: () => void;
  markInitialized: () => void;
}

function syncAuthCookies(role?: string) {
  if (typeof document === 'undefined') return;
  if (role) {
    document.cookie = `ac_role=${role}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `ac_auth=1; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = 'ac_role=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'ac_auth=; path=/; max-age=0; SameSite=Lax';
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,
  isLoggingOut: false,
  setSession: (session) => {
    syncAuthCookies(session.user.role);
    set({
      accessToken: session.accessToken,
      user: session.user,
      isInitialized: true,
      isLoggingOut: false,
    });
  },
  updateUser: (partial) => {
    if (partial.role) {
      syncAuthCookies(partial.role);
    }
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    }));
  },
  clearSession: () => {
    syncAuthCookies();
    set({
      accessToken: null,
      user: null,
      isInitialized: true,
      isLoggingOut: false,
    });
  },
  startLogout: () => set({ isLoggingOut: true }),
  markInitialized: () => set({ isInitialized: true, isLoggingOut: false }),
}));
