import Image from 'next/image';
import Link from 'next/link';

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3 transition-opacity hover:opacity-90"
      aria-label="AlumniConnect home"
    >
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/5 p-1">
        <Image
          src="/images/logo.png"
          alt="AlumniConnect Logo"
          width={36}
          height={36}
          priority
          className="object-contain"
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-base font-extrabold tracking-tight text-slate-900">
          ALUMNI<span className="text-blue-600">CONNECT</span>
        </span>
        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          University Network
        </span>
      </div>
    </Link>
  );
}
