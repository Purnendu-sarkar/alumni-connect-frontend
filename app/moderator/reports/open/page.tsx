import { ModeratorReportsView } from '@/features/moderation/moderator-reports-view';

export default function ModeratorReportsOpenPage() {
  return <ModeratorReportsView currentRole="MODERATOR" basePath="/moderator" filterOpenOnly={true} />;
}
