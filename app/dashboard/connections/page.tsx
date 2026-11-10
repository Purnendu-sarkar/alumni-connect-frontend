'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export default function LegacyDashboardConnectionsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case 'STUDENT':
        router.replace('/student/connections');
        break;
      case 'ALUMNI':
        router.replace('/alumni/connections');
        break;
      case 'MODERATOR':
        router.replace('/moderator/dashboard');
        break;
      case 'SUPER_ADMIN':
        router.replace('/admin/connections');
        break;
      default:
        router.replace('/student/connections');
    }
  }, [user, router]);

  return null;
}
