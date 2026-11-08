'use client';

import React from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell allowedRole="MODERATOR">{children}</DashboardShell>;
}
