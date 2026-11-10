import { ModeratorJobsQueueView } from '@/features/moderation/moderator-jobs-queue-view';

export default function ModeratorJobsInReviewPage() {
  return <ModeratorJobsQueueView currentRole="MODERATOR" basePath="/moderator" filterMode="IN_REVIEW" />;
}
