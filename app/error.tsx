'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="page-shell loading-screen">
      <p className="eyebrow eyebrow--red">SYSTEM NOTE</p>
      <h1>That page lost its signal.</h1>
      <p className="lede">Try again. Your work and your network are still here.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
