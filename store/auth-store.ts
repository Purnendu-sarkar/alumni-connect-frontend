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

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,
  isLoggingOut: false,
  setSession: (session) =>
    set({
      accessToken: session.accessToken,
      user: session.user,
      isInitialized: true,
      isLoggingOut: false,
    }),
  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),
  clearSession: () =>
    set({
      accessToken: null,
      user: null,
      isInitialized: true,
      isLoggingOut: false,
    }),
  startLogout: () => set({ isLoggingOut: true }),
  markInitialized: () => set({ isInitialized: true, isLoggingOut: false }),
}));
