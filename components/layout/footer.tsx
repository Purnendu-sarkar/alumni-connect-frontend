import Link from 'next/link';
import { Brand } from './brand';
import { ShieldCheck, Heart, GraduationCap, Building2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-600 rounded-lg text-white">
                <GraduationCap size={20} />
              </span>
              <span className="font-extrabold text-white text-lg tracking-tight">ALUMNI CONNECT</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The verified, single-institution network bridging graduates, current students, faculty mentors, and academic career opportunities.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck size={15} /> 100% Institutional Verification Required
            </div>
          </div>

          {/* Directory & Career */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Network & Careers</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/alumni" className="hover:text-white transition-colors">Alumni Directory</Link></li>
              <li><Link href="/jobs" className="hover:text-white transition-colors">Campus Job Board</Link></li>
              <li><Link href="/mentorship" className="hover:text-white transition-colors">Mentorship Program</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Campus Events</Link></li>
            </ul>
          </div>

          {/* Community & Impact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Impact & Records</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/stories" className="hover:text-white transition-colors">Alumni Success Stories</Link></li>
              <li><Link href="/giving" className="hover:text-white transition-colors">Endowment & Giving</Link></li>
              <li><Link href="/announcements" className="hover:text-white transition-colors">Official Circulars</Link></li>
            </ul>
          </div>

          {/* Access & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Portals & Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-white transition-colors">Member Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/student/dashboard" className="hover:text-white transition-colors">Student Desk</Link></li>
              <li><Link href="/alumni/dashboard" className="hover:text-white transition-colors">Alumni Desk</Link></li>
              <li><Link href="/moderator/dashboard" className="hover:text-white transition-colors">Moderator Desk</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">Super Admin Desk</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AlumniConnect. Verified Single-University Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built for the university community</span>
            <span className="flex items-center gap-1">Privacy First <ShieldCheck size={13} className="text-blue-400" /></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
