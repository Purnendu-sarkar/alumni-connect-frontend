import { ModeratorContentView } from '@/features/moderation/moderator-content-view';

export default function ModeratorContentPage() {
  return <ModeratorContentView currentRole="MODERATOR" basePath="/moderator" pendingOnly={false} />;
}
