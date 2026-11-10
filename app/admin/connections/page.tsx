import { ConnectionsView } from '@/features/connections/connections-view';

export default function AdminConnectionsPage() {
  return <ConnectionsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
