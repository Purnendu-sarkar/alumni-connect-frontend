'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export default function LegacyDashboardProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case 'STUDENT':
        router.replace('/student/profile');
        break;
      case 'ALUMNI':
        router.replace('/alumni/profile');
        break;
      case 'MODERATOR':
        router.replace('/moderator/profile');
        break;
      case 'SUPER_ADMIN':
        router.replace('/admin/profile');
        break;
      default:
        router.replace('/student/profile');
    }
  }, [user, router]);

  return null;
}
