import { redirect } from 'next/navigation';

export default function LegacyDashboardAdminAuditLogsPage() {
  redirect('/admin/activity-logs');
}
