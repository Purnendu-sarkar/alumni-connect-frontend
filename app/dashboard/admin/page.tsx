'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function AdminDashboardRedirectPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      router.replace('/dashboard/super-admin');
    } else {
      router.replace('/dashboard');
    }
  }, [user, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
      <p style={{ color: 'var(--muted, #666)', fontSize: '0.95rem' }}>Redirecting to Super Admin Console…</p>
    </div>
  );
}
