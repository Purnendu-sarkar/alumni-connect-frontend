'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    switch (role) {
      case 'STUDENT':
        router.replace('/student/dashboard');
        break;
      case 'ALUMNI':
        router.replace('/alumni/dashboard');
        break;
      case 'MODERATOR':
        router.replace('/moderator/dashboard');
        break;
      case 'SUPER_ADMIN':
        router.replace('/admin/dashboard');
        break;
      default:
        router.replace('/login');
    }
  }, [user, role, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-xs font-medium text-slate-500">Redirecting to your role workspace...</p>
      </div>
    </div>
  );
}

