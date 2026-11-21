import { MessagingView } from '@/features/messaging/messaging-view';

interface AlumniMessagesPageProps {
  searchParams: Promise<{ user?: string }>;
}

export default async function AlumniMessagesPage({ searchParams }: AlumniMessagesPageProps) {
  const params = await searchParams;
  return <MessagingView currentRole="ALUMNI" basePath="/alumni" initialUserId={params.user} />;
}
