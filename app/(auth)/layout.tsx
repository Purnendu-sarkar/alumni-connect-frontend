import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

import { Brand } from '@/components/layout/brand';

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans">
      {/* Brand Hero Column (Visible on lg+) */}
      <div className="hidden lg:flex lg:col-span-5 bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-12 flex-col justify-between border-r border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-600 rounded-lg text-white">
                <GraduationCap size={20} />
              </span>
              <span className="font-extrabold text-white text-lg tracking-tight">ALUMNI CONNECT</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Verified Network
            </span>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors pt-2"
          >
            <ArrowLeft size={14} /> Back to Public Home
          </Link>
        </div>

        <div className="space-y-6 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold font-mono">
            <Sparkles size={13} /> CAMPUS GATEWAY
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug m-0">
            The Lifelong University Network.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed m-0">
            Connect with verified alumni, current students, and faculty mentors. Discover exclusive opportunities, request 1-on-1 career guidance, and stay connected with your alma mater.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80">
            <div>
              <span className="block text-xl font-extrabold text-blue-400 font-mono">10,000+</span>
              <span className="text-[11px] text-slate-400 font-medium">Graduates</span>
            </div>
            <div>
              <span className="block text-xl font-extrabold text-emerald-400 font-mono">100%</span>
              <span className="text-[11px] text-slate-400 font-medium">Verified Profiles</span>
            </div>
            <div>
              <span className="block text-xl font-extrabold text-amber-400 font-mono">0 Spam</span>
              <span className="text-[11px] text-slate-400 font-medium">Single Campus</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Privacy-First Academic Architecture</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <ShieldCheck size={14} /> Encrypted Sessions
          </span>
        </div>
      </div>

      {/* Auth Content Column */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12">
        <div className="lg:hidden w-full max-w-md mb-6 flex items-center justify-between">
          <Brand />
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Home
          </Link>
        </div>

        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </main>
  );
}
