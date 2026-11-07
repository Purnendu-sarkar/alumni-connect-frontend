import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-5">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Access Denied (403)</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Restricted Institutional Area</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your account role does not have authorization to view this section of the university portal.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Your Dashboard</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}

