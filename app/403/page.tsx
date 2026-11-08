import Link from 'next/link';
import { ArrowLeft, Lock, ShieldAlert, ShieldX } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <section className="page-shell" style={{ padding: '6rem 0', maxWidth: '640px' }}>
      <p className="eyebrow eyebrow--red">SECURITY ACCESS RESTRICTION · HTTP 403</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
        <ShieldX size={44} color="#ef4444" />
        <h1 style={{ margin: 0, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}>Access Denied.</h1>
      </div>
      <p className="lede">
        Your current session does not possess the requisite role credentials or permissions to view this administrative resource.
      </p>

      <div
        style={{
          marginTop: '2rem',
          padding: '1.25rem',
          border: '2px solid var(--ink)',
          background: 'var(--surface)',
        }}
      >
        <p className="eyebrow">ROLE-BASED ACCESS CONTROL (RBAC)</p>
        <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>
          AlumniConnect enforces strict boundary isolation between <strong>Student</strong>, <strong>Alumni</strong>, <strong>Moderator</strong>, and <strong>Super Admin</strong> dashboards. Multi-tenant governance prohibits unauthorized horizontal or vertical privilege escalation.
        </p>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft size={16} /> Return to Your Authorized Dashboard
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/login">Sign in with Different Credentials</Link>
        </Button>
      </div>
    </section>
  );
}
