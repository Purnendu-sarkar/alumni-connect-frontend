import Link from 'next/link';
import { ArrowUpRight, Building2 } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Alumni } from '@/types/domain';

export function AlumniCard({ alumnus }: { alumnus: Alumni }) {
  return (
    <article className="alumni-card">
      <div className="alumni-card__top"><Avatar name={alumnus.name} src={alumnus.avatarUrl} /><Badge variant="success">Verified</Badge></div>
      <h3>{alumnus.name}</h3>
      <p className="alumni-card__role">{alumnus.position ?? 'Alumni member'}</p>
      <p className="alumni-card__company"><Building2 size={15} /> {alumnus.currentCompany ?? 'University network'}</p>
      <p className="alumni-card__bio">{alumnus.bio}</p>
      <div className="tag-list">{alumnus.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
      <Link href={`/alumni/${alumnus.id}`} className="text-link">View profile <ArrowUpRight size={16} /></Link>
    </article>
  );
}
