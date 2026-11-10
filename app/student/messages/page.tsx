import { MessagingView } from '@/features/messaging/messaging-view';

export default function StudentMessagesPage() {
  return <MessagingView currentRole="STUDENT" basePath="/student" />;
}
