import { JobDetailView } from '@/features/jobs/job-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminJobDetailPage({ params }: Props) {
  const { id } = await params;
  return <JobDetailView id={id} currentRole="SUPER_ADMIN" basePath="/admin" />;
}
