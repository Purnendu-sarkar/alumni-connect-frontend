import { StoriesListView } from '@/features/stories/stories-list-view';

export default function StudentStoriesPage() {
  return <StoriesListView currentRole="STUDENT" basePath="/student" />;
}
