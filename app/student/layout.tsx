import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <DashboardShell requiredRole="STUDENT">{children}</DashboardShell>;
}
