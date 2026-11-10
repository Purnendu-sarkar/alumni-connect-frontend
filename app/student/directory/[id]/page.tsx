import { MemberDetailView } from '@/features/directory/member-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDirectoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <MemberDetailView id={id} currentRole="STUDENT" basePath="/student" />;
}
