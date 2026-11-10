import { AdminActivityLogsView } from '@/features/analytics/admin-activity-logs-view';

export default function AdminActivityLogsPage() {
  return <AdminActivityLogsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
