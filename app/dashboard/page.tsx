'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardEntryPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    switch (user.role) {
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
        router.replace('/student/dashboard');
    }
  }, [user, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
      <p style={{ color: 'var(--muted, #666)', fontSize: '0.95rem' }}>Resolving role desk…</p>
    </div>
  );
}
