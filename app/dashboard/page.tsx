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
        router.replace('/dashboard/student');
        break;
      case 'ALUMNI':
        router.replace('/dashboard/alumni');
        break;
      case 'MODERATOR':
        router.replace('/dashboard/moderator');
        break;
      case 'ADMIN':
        router.replace('/dashboard/admin');
        break;
      case 'SUPER_ADMIN':
        router.replace('/dashboard/super-admin');
        break;
      default:
        router.replace('/dashboard/student');
    }
  }, [user, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
      <p style={{ color: 'var(--muted, #666)', fontSize: '0.95rem' }}>Resolving role desk…</p>
    </div>
  );
}
