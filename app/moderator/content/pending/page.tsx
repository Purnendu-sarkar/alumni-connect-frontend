import { ModeratorContentView } from '@/features/moderation/moderator-content-view';

export default function ModeratorContentPendingPage() {
  return <ModeratorContentView currentRole="MODERATOR" basePath="/moderator" pendingOnly={true} />;
}
