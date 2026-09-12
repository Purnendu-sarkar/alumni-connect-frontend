import Image from 'next/image';
import Link from 'next/link';

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="AlumniConnect home">
      <Image src="/images/logo.png" alt="" width={48} height={48} priority />
      <span>ALUMNI<span className="brand__mark">CONNECT</span></span>
    </Link>
  );
}
