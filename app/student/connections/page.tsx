import { ConnectionsView } from '@/features/connections/connections-view';

export default function StudentConnectionsPage() {
  return <ConnectionsView currentRole="STUDENT" basePath="/student" initialTab="active" />;
}
