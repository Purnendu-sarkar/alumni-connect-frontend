'use client';

import React from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell allowedRole="SUPER_ADMIN">{children}</DashboardShell>;
}
