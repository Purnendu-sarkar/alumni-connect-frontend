import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function ModeratorLayout({ children }: { children: ReactNode }) {
  return <DashboardShell requiredRole="MODERATOR">{children}</DashboardShell>;
}
