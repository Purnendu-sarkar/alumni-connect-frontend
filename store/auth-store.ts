import { create } from 'zustand';

import type { SessionUser } from '@/types/domain';

interface AuthState {
  accessToken: string | null;
  user: SessionUser | null;
  setSession: (session: { accessToken: string; user: SessionUser }) => void;
  updateUser: (partial: Partial<SessionUser>) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (session) => set(session),
  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),
  clearSession: () => set({ accessToken: null, user: null }),
}));
