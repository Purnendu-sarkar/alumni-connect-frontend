import { StoryDetailView } from '@/features/stories/story-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminStoryDetailPage({ params }: Props) {
  const { id } = await params;
  return <StoryDetailView id={id} currentRole="SUPER_ADMIN" basePath="/admin" />;
}
