import { ConnectionsView } from '@/features/connections/connections-view';

export default function StudentConnectionRequestsPage() {
  return <ConnectionsView currentRole="STUDENT" basePath="/student" initialTab="pending" />;
}
