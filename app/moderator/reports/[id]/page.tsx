import { ModeratorReportDetailView } from '@/features/moderation/moderator-report-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ModeratorReportDetailPage({ params }: Props) {
  const { id } = await params;
  return <ModeratorReportDetailView id={id} currentRole="MODERATOR" basePath="/moderator" />;
}
