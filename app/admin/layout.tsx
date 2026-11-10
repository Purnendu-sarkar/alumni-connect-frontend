import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashboardShell requiredRole="SUPER_ADMIN">{children}</DashboardShell>;
}
