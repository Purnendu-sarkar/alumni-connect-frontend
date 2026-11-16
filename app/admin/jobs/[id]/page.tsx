import { ModeratorJobInspectView } from '@/features/moderation/moderator-job-inspect-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminJobDetailPage({ params }: Props) {
  const { id } = await params;
  return <ModeratorJobInspectView id={id} currentRole="SUPER_ADMIN" basePath="/admin" />;
}
