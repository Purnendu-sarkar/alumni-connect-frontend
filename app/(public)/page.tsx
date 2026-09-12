import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  Search,
  ShieldCheck,
} from 'lucide-react';

import { AlumniCard } from '@/components/alumni/alumni-card';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { demoAlumni, demoJobs } from '@/features/shared/demo-data';
import { formatCompactNumber } from '@/lib/utils/format';

const proofPoints = [
  ['03', 'WAYS TO GROW', 'Mentorship, referrals, and shared knowledge.'],
  ['01', 'TRUSTED NETWORK', 'A verified space for your university community.'],
  ['24/7', 'OPEN DOOR', 'Every valuable conversation starts with a hello.'],
];

export default function HomePage() {
  return (
    <>
      <section className="hero page-shell">
        <p className="eyebrow">THE ALUMNI NETWORK / ISSUE 01</p>
        <div className="hero__grid">
          <div>
            <h1>Your next big move has a familiar face.</h1>
            <p className="lede">
              Find the people who took the road before you. Ask better questions. Make work that
              matters.
            </p>
            <div className="hero__actions">
              <Button asChild size="lg">
                <Link href="/alumni">
                  Find your people <ArrowUpRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/register">Join the network</Link>
              </Button>
            </div>
          </div>
          <aside className="hero__statement">
            <span>“</span>
            <p>The best opportunity is usually one introduction away.</p>
            <div>ALUMNICONNECT EDITORIAL DESK</div>
          </aside>
        </div>
        <div className="hero__ticker">
          <span>MENTORS</span><span>•</span><span>JOBS</span><span>•</span><span>IDEAS</span><span>•</span><span>YOUR PEOPLE</span>
        </div>
      </section>

      <section className="proof-strip page-shell" aria-label="Network benefits">
        {proofPoints.map(([number, title, description]) => (
          <article key={title}>
            <strong>{number}</strong>
            <div><p className="eyebrow">{title}</p><p>{description}</p></div>
          </article>
        ))}
      </section>

      <section className="page-shell editorial-section">
        <SectionHeading
          eyebrow="THE DIRECTORY"
          title="People worth knowing."
          action={<Link href="/alumni" className="text-link">Explore every alumnus <ArrowUpRight size={16} /></Link>}
        />
        <div className="directory-prompt">
          <Search size={24} />
          <p>Search by batch, department, company, or the one skill you want to learn next.</p>
          <Link href="/alumni" aria-label="Explore the alumni directory"><ArrowDownRight size={26} /></Link>
        </div>
        <div className="alumni-grid">
          {demoAlumni.slice(0, 3).map((alumnus) => <AlumniCard key={alumnus.id} alumnus={alumnus} />)}
        </div>
      </section>

      <section className="callout-section">
        <div className="page-shell callout-section__inner">
          <p className="eyebrow">THE MENTORSHIP DESK</p>
          <h2>One honest conversation can change your direction.</h2>
          <p>Request a focused thirty-minute session with an alumnus who has built a path you are considering.</p>
          <Button asChild variant="secondary"><Link href="/register">Request a mentor</Link></Button>
        </div>
      </section>

      <section className="page-shell editorial-section jobs-preview">
        <SectionHeading
          eyebrow="ON THE BOARD"
          title="Work worth showing up for."
          action={<Link href="/jobs" className="text-link">See all opportunities <ArrowUpRight size={16} /></Link>}
        />
        <div className="job-list">{demoJobs.map((job) => <JobCard key={job.id} job={job} />)}</div>
      </section>

      <section className="page-shell stats-section">
        <div><p className="eyebrow">A NETWORK WITH RECEIPTS</p><h2>Not another group chat.</h2></div>
        <div className="stats-grid">
          <article><strong>{formatCompactNumber(2400)}</strong><span>VERIFIED MEMBERS</span></article>
          <article><strong>186</strong><span>MENTORS AVAILABLE</span></article>
          <article><strong>42</strong><span>OPEN OPPORTUNITIES</span></article>
        </div>
      </section>

      <section className="page-shell latest-section">
        <div className="latest-section__title"><CalendarDays size={30} /><p className="eyebrow">UP NEXT</p><h2>The annual alumni homecoming.</h2></div>
        <div>
          <p className="event-date">12<br /><span>OCT</span></p>
          <p>Return to campus for conversations, classes, and the people who made the place matter.</p>
          <Button asChild variant="ghost"><Link href="/events">See event details <ArrowUpRight size={16} /></Link></Button>
        </div>
      </section>

      <section className="page-shell join-banner">
        <GraduationCap size={48} />
        <div><p className="eyebrow">YOUR NAME BELONGS HERE</p><h2>Bring your story into the room.</h2></div>
        <Button asChild size="lg"><Link href="/register">Create your profile <ShieldCheck size={18} /></Link></Button>
      </section>
    </>
  );
}
