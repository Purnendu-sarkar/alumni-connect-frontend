import { ConnectionsView } from '@/features/connections/connections-view';

export default function AlumniConnectionRequestsPage() {
  return <ConnectionsView currentRole="ALUMNI" basePath="/alumni" initialTab="pending" />;
}
