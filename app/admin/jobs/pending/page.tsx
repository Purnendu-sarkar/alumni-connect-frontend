import { ModeratorJobsQueueView } from '@/features/moderation/moderator-jobs-queue-view';

export default function AdminJobsPendingPage() {
  return <ModeratorJobsQueueView currentRole="SUPER_ADMIN" basePath="/admin" filterMode="PENDING" />;
}
