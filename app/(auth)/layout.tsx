import type { ReactNode } from 'react';

import { Brand } from '@/components/layout/brand';

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="auth-layout">
      <div className="auth-layout__brand">
        <div className="auth-layout__brand-header">
          <Brand />
          <span className="auth-layout__badge">OFFICIAL ALUMNI NETWORK</span>
        </div>

        <div className="auth-layout__brand-middle">
          <h2>The Lifelong University Network.</h2>
          <p>
            Connect with verified alumni, current students, and faculty. Discover exclusive career opportunities, find mentors, and stay engaged with your alma mater.
          </p>

          <div className="auth-layout__stats-strip">
            <div>
              <strong>10,000+</strong>
              <span>Graduates</span>
            </div>
            <div className="auth-layout__stats-divider" />
            <div>
              <strong>50+</strong>
              <span>Programs</span>
            </div>
            <div className="auth-layout__stats-divider" />
            <div>
              <strong>100%</strong>
              <span>Verified</span>
            </div>
          </div>
        </div>

        <div className="auth-layout__brand-footer">
          <p>THE NETWORK IS WAITING.</p>
        </div>
      </div>

      <div className="auth-layout__content">
        {children}
      </div>
    </main>
  );
}

