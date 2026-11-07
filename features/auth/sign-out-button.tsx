'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

export function SignOutButton() {
  const { logout, isLoggingOut } = useAuth();

  return (
    <button
      type="button"
      onClick={() => logout()}
      disabled={isLoggingOut}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
    </button>
  );
}
