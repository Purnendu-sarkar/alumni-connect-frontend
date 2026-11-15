import { AdminActivityLogsView } from '@/features/analytics/admin-activity-logs-view';

export default function AdminAuditLogsPage() {
  return <AdminActivityLogsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
