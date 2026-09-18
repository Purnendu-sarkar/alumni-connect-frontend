'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { logout } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';

export function SignOutButton() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const signOut = async () => {
    try { await logout(); } finally { clearSession(); router.replace('/login'); }
  };
  return <Button variant="ghost" size="sm" onClick={signOut}><LogOut size={16} /> Sign out</Button>;
}
