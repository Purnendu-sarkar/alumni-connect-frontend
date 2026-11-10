import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2.5 font-sans font-extrabold text-base tracking-tight select-none group',
        className
      )}
      aria-label="AlumniConnect home"
    >
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0 group-hover:bg-blue-700 transition-colors">
        <GraduationCap size={18} strokeWidth={2.4} />
      </div>
      <span className="flex items-center tracking-tight font-sans">
        <span className="text-slate-900 font-extrabold text-sm sm:text-base">ALUMNI</span>
        <span className="text-blue-600 font-extrabold text-sm sm:text-base ml-1">CONNECT</span>
      </span>
    </Link>
  );
}
