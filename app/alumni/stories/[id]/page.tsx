import { StoryDetailView } from '@/features/stories/story-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AlumniStoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <StoryDetailView id={id} currentRole="ALUMNI" basePath="/alumni" />;
}
