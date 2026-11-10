import { MyEventsView } from '@/features/events/my-events-view';

export default function StudentMyEventsPage() {
  return <MyEventsView currentRole="STUDENT" basePath="/student" />;
}
