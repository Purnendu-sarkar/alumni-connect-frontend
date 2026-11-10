import { ModeratorContentView } from '@/features/moderation/moderator-content-view';

export default function AdminContentPage() {
  return <ModeratorContentView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
