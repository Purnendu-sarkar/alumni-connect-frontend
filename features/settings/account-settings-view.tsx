'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Save, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AccountSettingsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AccountSettingsView({ currentRole, basePath }: AccountSettingsViewProps) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name });
    setNotice('Account settings saved.');
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        backHref={`${basePath}/settings`}
        backLabel="Back to Settings"
        eyebrow="BASIC INFORMATION"
        title="Account Details"
        description="Manage your institutional identification, primary account name, and connected university affiliation."
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Display Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Institutional Email Address"
            value={email}
            disabled
            hint="Email addresses are verified institutional identifiers and cannot be modified directly."
          />

          <Input
            label="University Campus"
            value={user?.university?.name || 'North Western University'}
            disabled
            hint="Scoped single-university platform."
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" size="sm">
              <Save size={14} /> Save Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
