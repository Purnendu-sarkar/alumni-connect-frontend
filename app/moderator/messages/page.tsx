import { MessagingView } from '@/features/messaging/messaging-view';

interface ModeratorMessagesPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function ModeratorMessagesPage({ searchParams }: ModeratorMessagesPageProps) {
  const params = await searchParams;
  return <MessagingView currentRole="MODERATOR" basePath="/moderator" initialUserId={params.user} />;
}
