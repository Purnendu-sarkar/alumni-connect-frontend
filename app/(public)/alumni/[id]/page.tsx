import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Building2, GraduationCap } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { demoAlumni } from '@/features/shared/demo-data';

export default async function AlumniProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alumnus = demoAlumni.find((person) => person.id === id) ?? demoAlumni[0];

  return (
    <section className="page-shell profile-page">
      <Link href="/alumni" className="back-link"><ArrowLeft size={16} /> Back to directory</Link>
      <div className="profile-hero">
        <Avatar name={alumnus.name} src={alumnus.avatarUrl} className="avatar--xl" />
        <div>
          <Badge variant="success">Verified alumnus</Badge>
          <h1>{alumnus.name}</h1>
          <p className="profile-hero__role">{alumnus.position} · {alumnus.currentCompany}</p>
          <p>{alumnus.bio}</p>
        </div>
        <Button asChild><Link href="/register">Request a connection <ArrowUpRight size={17} /></Link></Button>
      </div>
      <div className="profile-grid">
        <article><p className="eyebrow">AT A GLANCE</p><p><Building2 size={17} /> {alumnus.currentCompany}</p><p><GraduationCap size={17} /> Class of {alumnus.batch} · {alumnus.department}</p></article>
        <article><p className="eyebrow">CAN HELP WITH</p><div className="tag-list">{alumnus.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>
      </div>
    </section>
  );
}
