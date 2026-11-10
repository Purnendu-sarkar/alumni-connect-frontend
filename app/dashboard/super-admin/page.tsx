import { redirect } from 'next/navigation';

export default function LegacyDashboardSuperAdminPage() {
  redirect('/admin/dashboard');
}
