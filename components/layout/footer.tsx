import Link from 'next/link';

import { Brand } from './brand';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__masthead"><Brand /><p>THE VERIFIED UNIVERSITY NETWORK.</p></div>
      <div className="site-footer__grid">
        <p>AlumniConnect brings graduates, students, mentors, and opportunity into one trusted place.</p>
        <div><p className="eyebrow">EXPLORE</p><Link href="/alumni">Directory</Link><Link href="/jobs">Jobs</Link><Link href="/events">Events</Link></div>
        <div><p className="eyebrow">MEMBERS</p><Link href="/login">Sign in</Link><Link href="/register">Create account</Link><Link href="/dashboard">Dashboard</Link></div>
      </div>
      <div className="site-footer__bottom"><span>© {new Date().getFullYear()} ALUMNICONNECT</span><span>BUILT FOR THE NEXT CLASS.</span></div>
    </footer>
  );
}
