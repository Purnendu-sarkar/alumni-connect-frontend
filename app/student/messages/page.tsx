import { MessagingView } from '@/features/messaging/messaging-view';

interface StudentMessagesPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function StudentMessagesPage({ searchParams }: StudentMessagesPageProps) {
  const params = await searchParams;
  return <MessagingView currentRole="STUDENT" basePath="/student" initialUserId={params.user} />;
}
