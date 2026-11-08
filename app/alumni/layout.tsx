'use client';

import React from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function AlumniLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell allowedRole="ALUMNI">{children}</DashboardShell>;
}
