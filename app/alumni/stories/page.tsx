import { StoriesListView } from '@/features/stories/stories-list-view';

export default function AlumniStoriesPage() {
  return <StoriesListView currentRole="ALUMNI" basePath="/alumni" />;
}
