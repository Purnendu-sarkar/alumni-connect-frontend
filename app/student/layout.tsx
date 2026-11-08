'use client';

import React from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell allowedRole="STUDENT">{children}</DashboardShell>;
}
