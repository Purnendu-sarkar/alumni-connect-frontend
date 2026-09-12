import Link from 'next/link';
import { ArrowUpRight, CircleCheckBig, UserRound } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  return (
    <section className="dashboard-page profile-page">
      <p className="eyebrow">YOUR MEMBER CARD</p>
      <div className="profile-hero">
        <Avatar name="Purnendu" className="avatar--xl" />
        <div>
          <Badge variant="success"><CircleCheckBig size={13} /> Verified member</Badge>
          <h1>Purnendu Kumar</h1>
          <p className="profile-hero__role">Alumni · CSE, Class of 2020</p>
        </div>
        <Button asChild><Link href="/alumni">View directory <ArrowUpRight size={16} /></Link></Button>
      </div>
      <div className="profile-grid">
        <article><p className="eyebrow">PROFILE STATUS</p><h2>Make it useful.</h2><p>Add your focus, experience, and availability so the right people can reach you with an informed ask.</p></article>
        <article><p className="eyebrow">VISIBILITY</p><h2>Verified community</h2><p>Your professional details are visible only to verified members of your university network.</p></article>
        <article><p className="eyebrow">MENTORING</p><h2>Open to share.</h2><p>Choose the questions and career paths where you can be especially helpful.</p></article>
        <article><p className="eyebrow">NEXT</p><h2>Finish your details.</h2><p>Profile editing is ready to connect as soon as the account-profile endpoint is enabled.</p></article>
      </div>
      <p className="empty-state"><UserRound size={22} /> Your profile workspace is ready for the account API.</p>
    </section>
  );
}
