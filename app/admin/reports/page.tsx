import { ModeratorReportsView } from '@/features/moderation/moderator-reports-view';

export default function AdminReportsPage() {
  return <ModeratorReportsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
