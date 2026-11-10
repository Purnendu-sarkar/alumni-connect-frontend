'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export default function LegacyDashboardJobsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case 'STUDENT':
        router.replace('/student/jobs');
        break;
      case 'ALUMNI':
        router.replace('/alumni/jobs');
        break;
      case 'MODERATOR':
        router.replace('/moderator/jobs');
        break;
      case 'SUPER_ADMIN':
        router.replace('/admin/jobs');
        break;
      default:
        router.replace('/student/jobs');
    }
  }, [user, router]);

  return null;
}
