import { MemberDirectoryView } from '@/features/directory/member-directory-view';

export default function AlumniDirectoryPage() {
  return <MemberDirectoryView currentRole="ALUMNI" basePath="/alumni" />;
}
