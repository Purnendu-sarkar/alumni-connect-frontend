'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { logout } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

export function SignOutButton() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const startLogout = useAuthStore((state) => state.startLogout);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);

  const signOut = async () => {
    if (isLoggingOut) return;
    startLogout();
    try {
      await logout();
    } finally {
      clearSession();
      router.replace('/login');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={signOut}
      className="w-full justify-start text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold"
    >
      <LogOut size={15} />
      <span>Sign out</span>
    </Button>
  );
}
