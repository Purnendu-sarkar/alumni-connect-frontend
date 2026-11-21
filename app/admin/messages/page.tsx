import { MessagingView } from '@/features/messaging/messaging-view';

interface AdminMessagesPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function AdminMessagesPage({ searchParams }: AdminMessagesPageProps) {
  const params = await searchParams;
  return <MessagingView currentRole="SUPER_ADMIN" basePath="/admin" initialUserId={params.user} />;
}
