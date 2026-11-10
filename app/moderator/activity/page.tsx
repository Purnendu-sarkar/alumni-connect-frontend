import { ModeratorActivityView } from '@/features/moderation/moderator-activity-view';

export default function ModeratorActivityPage() {
  return <ModeratorActivityView currentRole="MODERATOR" basePath="/moderator" />;
}
