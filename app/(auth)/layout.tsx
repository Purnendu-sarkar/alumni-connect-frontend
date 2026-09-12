import type { ReactNode } from 'react';

import { Brand } from '@/components/layout/brand';

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <main className="auth-layout"><div className="auth-layout__brand"><Brand /><p>THE NETWORK IS WAITING.</p></div>{children}</main>;
}
