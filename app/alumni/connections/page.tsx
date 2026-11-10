import { ConnectionsView } from '@/features/connections/connections-view';

export default function AlumniConnectionsPage() {
  return <ConnectionsView currentRole="ALUMNI" basePath="/alumni" initialTab="active" />;
}
