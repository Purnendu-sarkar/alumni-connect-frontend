'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Save, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { updateMe } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AccountSettingsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AccountSettingsView({ currentRole, basePath }: AccountSettingsViewProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: (newName: string) => updateMe(accessToken, { name: newName }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      if (res.data?.name) {
        updateUser({ name: res.data.name });
      } else {
        updateUser({ name });
      }
      setNotice('Account settings saved and synchronized with database.');
      setFormError(null);
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'Failed to save account settings.');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setFormError(null);

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setFormError('Display name must be at least 2 characters.');
      return;
    }

    saveMutation.mutate(trimmed);
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

      {formError ? <FormAlert>{formError}</FormAlert> : null}

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
            <Button type="submit" size="sm" disabled={saveMutation.isPending}>
              <Save size={14} /> {saveMutation.isPending ? 'Saving to Database…' : 'Save Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
