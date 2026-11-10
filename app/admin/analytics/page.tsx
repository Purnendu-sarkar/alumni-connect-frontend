import { AdminAnalyticsView } from '@/features/analytics/admin-analytics-view';

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsView currentRole="SUPER_ADMIN" basePath="/admin" />;
}
