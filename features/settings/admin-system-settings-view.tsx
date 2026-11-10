'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Save, Server, Shield, Sliders } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AdminSystemSettingsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AdminSystemSettingsView({ currentRole, basePath }: AdminSystemSettingsViewProps) {
  const user = useAuthStore((state) => state.user);

  const [universityName, setUniversityName] = useState(user?.university?.name || 'North Western University');
  const [domain, setDomain] = useState(user?.university?.domain || 'nwu.ac.bd');
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState(60);
  const [moderatorAutoApproval, setModeratorAutoApproval] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice('Platform governance configurations applied.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="PLATFORM GOVERNANCE"
        title="System & Tenant Configuration"
        description="Configure university identity parameters, domain constraints, security policies, and review automation."
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="University Institution Name *"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              required
            />

            <Input
              label="Authorized Campus Domain *"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              hint="Only emails matching this institutional domain can register."
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-500 m-0">Security & Authentication Policy</h4>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-bold text-slate-800 m-0">Enforce Institutional Email Verification</p>
                <p className="text-slate-500 m-0 mt-0.5">Require 6-digit OTP verification before profile setup is permitted.</p>
              </div>
              <input
                type="checkbox"
                checked={requireEmailVerification}
                onChange={(e) => setRequireEmailVerification(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800 m-0">Super Admin Re-authentication Window</p>
                <p className="text-slate-500 m-0 mt-0.5">Elevated security actions require password confirmation after duration.</p>
              </div>
              <select
                value={sessionTimeoutMin}
                onChange={(e) => setSessionTimeoutMin(Number(e.target.value))}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" size="sm">
              <Save size={14} /> Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
