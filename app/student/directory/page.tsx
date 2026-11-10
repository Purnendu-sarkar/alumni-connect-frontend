import { MemberDirectoryView } from '@/features/directory/member-directory-view';

export default function StudentDirectoryPage() {
  return <MemberDirectoryView currentRole="STUDENT" basePath="/student" />;
}
