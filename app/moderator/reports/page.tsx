import { ModeratorReportsView } from '@/features/moderation/moderator-reports-view';

export default function ModeratorReportsPage() {
  return <ModeratorReportsView currentRole="MODERATOR" basePath="/moderator" filterOpenOnly={false} />;
}
