'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuth, type UserRole } from '@/lib/hooks/use-auth';

export function RequireAuth({
  children,
  allowedRoles,
}: Readonly<{
  children: ReactNode;
  allowedRoles?: UserRole[];
}>) {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    } else if (!isLoading && user && allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace('/403');
    }
  }, [user, role, isLoading, router, allowedRoles]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
