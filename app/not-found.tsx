import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="page-shell loading-screen">
      <p className="eyebrow eyebrow--red">404 / NOT FOUND</p>
      <h1>This address has graduated.</h1>
      <p className="lede">Return to the network and find a more useful connection.</p>
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}
