import { StoriesListView } from '@/features/stories/stories-list-view';

export default function AdminStoriesPage() {
  return <StoriesListView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
