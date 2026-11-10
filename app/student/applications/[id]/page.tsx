import { JobDetailView } from '@/features/jobs/job-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <JobDetailView id={id} currentRole="STUDENT" basePath="/student" />;
}
