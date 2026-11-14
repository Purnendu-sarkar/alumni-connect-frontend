'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { Check, CheckCircle2, Key, Lock, ShieldAlert, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { changePassword } from '@/lib/api/auth.api';
import { useAuthStore } from '@/store/auth-store';
import { changePasswordSchema } from '@/features/auth/auth.schemas';
import type { UserRole } from '@/types/domain';

interface SecuritySettingsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function SecuritySettingsView({ currentRole, basePath }: SecuritySettingsViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Real-time password requirement checks matching backend Zod schema
  const hasMinLength = newPassword.length >= 12;
  const hasLower = /[a-z]/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isPasswordValid = hasMinLength && hasLower && hasUpper && hasNumber && hasSymbol;

  const changeMutation = useMutation({
    mutationFn: () =>
      changePassword(accessToken, {
        currentPassword,
        newPassword,
      }),
    onSuccess: () => {
      setFormSuccess('Your password has been changed successfully. All active sessions have been updated.');
      updateUser({ needPasswordChange: false });
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

    const validation = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || 'Please meet all password security requirements.');
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

      {user?.needPasswordChange ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900 m-0">Mandatory Password Update Required</p>
            <p className="text-slate-600 m-0 mt-0.5">
              Your account currently requires an initial or reset password update. Please create a strong, institutional-grade password before accessing full dashboard features.
            </p>
          </div>
        </div>
      ) : null}

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
            required
          />

          {/* Real-time Password Strength Criteria Checklist */}
          {newPassword.length > 0 ? (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 animate-in fade-in">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 m-0 mb-1">
                Password Security Requirements
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                  {hasMinLength ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                  <span>Minimum 12 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                  {hasUpper ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                  <span>Uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                  {hasLower ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                  <span>Lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                  {hasNumber ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                  <span>Numeric digit (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSymbol ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                  {hasSymbol ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                  <span>Special symbol (!@#$%^&*)</span>
                </div>
                {confirmPassword.length > 0 ? (
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 font-semibold' : 'text-red-500'}`}>
                    {passwordsMatch ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                    <span>Passwords match</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 m-0">
              Password must be at least 12 characters, including uppercase, lowercase, number, and special symbol.
            </p>
          )}

          <Input
            label="Confirm New Password *"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={changeMutation.isPending || !isPasswordValid || !passwordsMatch}
            >
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
