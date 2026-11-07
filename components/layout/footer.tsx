import Link from 'next/link';
import { Brand } from './brand';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 text-slate-600">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <Brand />
            <p className="text-xs text-slate-500 max-w-sm">
              Alumni Connect is the official private networking and opportunity platform connecting
              students, alumni, and university administration in a secure, verified environment.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Portal</p>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-blue-600">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-blue-600">Create Account</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600">Access Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Security & Trust</p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>Role-Based Access Control</li>
              <li>Institutional Verification</li>
              <li>Privacy-First Architecture</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>© {new Date().getFullYear()} Alumni Connect. All rights reserved.</span>
          <span>Single-University Verified Network</span>
        </div>
      </div>
    </footer>
  );
}
