'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Key, Lock, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { changePassword } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface SecuritySettingsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function SecuritySettingsView({ currentRole, basePath }: SecuritySettingsViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const changeMutation = useMutation({
    mutationFn: () =>
      changePassword(accessToken, {
        currentPassword,
        newPassword,
      }),
    onSuccess: () => {
      setFormSuccess('Your password has been changed successfully. All active sessions have been updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFormError(null);
      setTimeout(() => setFormSuccess(null), 5000);
    },
    onError: (err: unknown) => {
      setFormError(err instanceof Error ? err.message : 'Failed to change password. Verify your current password.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('New password and confirmation password do not match.');
      return;
    }

    changeMutation.mutate();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        backHref={`${basePath}/settings`}
        backLabel="Back to Settings"
        eyebrow="CREDENTIAL SECURITY"
        title="Security & Password"
        description="Update your secret password and monitor active institutional sessions."
      />

      {formSuccess ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      ) : null}

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password *"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password *"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="Minimum 8 characters with at least one number and uppercase letter."
            required
          />

          <Input
            label="Confirm New Password *"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" size="sm" disabled={changeMutation.isPending}>
              <Key size={14} /> {changeMutation.isPending ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>

      {/* Session Management */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 m-0">
          Active Browser Sessions
        </h3>
        <p className="text-xs text-slate-500 m-0">
          Sessions utilize rotating refresh tokens. Changing your password immediately revokes all alternate session cookies.
        </p>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-slate-800 m-0">Current Browser</p>
            <p className="text-slate-400 m-0 text-[11px]">Active Session · IP Verified</p>
          </div>
          <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
            <CheckCircle2 size={13} /> Active
          </span>
        </div>
      </div>
    </div>
  );
}
