import Link from 'next/link';
import { ArrowUpRight, Handshake, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { demoAlumni } from '@/features/shared/demo-data';

export default function ConnectionsPage() {
  return (
    <section className="dashboard-page">
      <p className="eyebrow">YOUR CIRCLE</p>
      <h1>Make a thoughtful introduction.</h1>
      <p className="lede">A good request tells someone why their perspective matters to you.</p>
      <SectionHeading eyebrow="SUGGESTED PEOPLE" title="Start with shared context." />
      <div className="alumni-grid">
        {demoAlumni.slice(0, 3).map((alumnus) => (
          <article className="alumni-card" key={alumnus.id}>
            <Handshake size={24} />
            <h2>{alumnus.name}</h2>
            <p className="alumni-card__company">{alumnus.position} · {alumnus.currentCompany}</p>
            <p>{alumnus.bio}</p>
            <Button asChild variant="ghost"><Link href={`/alumni/${alumnus.id}`}>Read profile <ArrowUpRight size={16} /></Link></Button>
          </article>
        ))}
      </div>
      <div className="dashboard-note"><p className="eyebrow">A BETTER ASK</p><h2>Be clear and kind.</h2><p>Connection requests and messages will appear here when you sign in against the live API.</p><Button asChild variant="secondary"><Link href="/alumni"><MessageCircle size={16} /> Find an alumnus</Link></Button></div>
    </section>
  );
}
