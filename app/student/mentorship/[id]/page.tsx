import { MentorshipDetailView } from '@/features/mentorship/mentorship-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentMentorshipDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <MentorshipDetailView id={id} currentRole="STUDENT" basePath="/student" />;
}
