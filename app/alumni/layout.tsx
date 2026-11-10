import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AlumniLayout({ children }: { children: ReactNode }) {
  return <DashboardShell requiredRole="ALUMNI">{children}</DashboardShell>;
}
