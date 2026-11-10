'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export default function LegacyDashboardSettingsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case 'STUDENT':
        router.replace('/student/settings');
        break;
      case 'ALUMNI':
        router.replace('/alumni/settings');
        break;
      case 'MODERATOR':
        router.replace('/moderator/settings');
        break;
      case 'SUPER_ADMIN':
        router.replace('/admin/settings');
        break;
      default:
        router.replace('/student/settings');
    }
  }, [user, router]);

  return null;
}
