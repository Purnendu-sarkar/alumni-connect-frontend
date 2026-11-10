import { ModeratorJobsQueueView } from '@/features/moderation/moderator-jobs-queue-view';

export default function ModeratorJobsPendingPage() {
  return <ModeratorJobsQueueView currentRole="MODERATOR" basePath="/moderator" filterMode="PENDING" />;
}
