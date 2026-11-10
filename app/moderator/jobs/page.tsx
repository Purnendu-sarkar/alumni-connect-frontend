import { ModeratorJobsQueueView } from '@/features/moderation/moderator-jobs-queue-view';

export default function ModeratorJobsPage() {
  return <ModeratorJobsQueueView currentRole="MODERATOR" basePath="/moderator" filterMode="ALL" />;
}
