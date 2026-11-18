import { StoryCreateForm } from '@/features/stories/story-create-form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStoryPage({ params }: PageProps) {
  const { id } = await params;
  return <StoryCreateForm currentRole="ALUMNI" basePath="/alumni" storyId={id} />;
}
