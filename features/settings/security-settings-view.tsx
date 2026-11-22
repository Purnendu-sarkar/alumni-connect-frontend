'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Globe,
  Key,
  Laptop,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  X,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { changePassword, getLoginHistory, type LoginHistoryItem } from '@/lib/api/auth.api';
import {
  getActiveSessions,
  revokeOtherSessions,
  revokeSession,
  type SessionItem,
} from '@/lib/api/sessions.api';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import { changePasswordSchema } from '@/features/auth/auth.schemas';
import type { UserRole } from '@/types/domain';

interface SecuritySettingsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function SecuritySettingsView({ currentRole, basePath }: SecuritySettingsViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [confirmRevokeOthersOpen, setConfirmRevokeOthersOpen] = useState(false);

  // Password criteria validation
  const hasMinLength = newPassword.length >= 12;
  const hasLower = /[a-z]/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isPasswordValid = hasMinLength && hasLower && hasUpper && hasNumber && hasSymbol;

  // Query: Active Sessions
  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await getActiveSessions(accessToken);
      if (!res.success || !res.data) throw new Error(res.message || 'Failed to load sessions');
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  // Query: Login Activity History
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['login-history'],
    queryFn: async () => {
      const res = await getLoginHistory(accessToken, 10);
      if (!res.success || !res.data) throw new Error(res.message || 'Failed to load login history');
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  // Mutation: Change Password
  const changeMutation = useMutation({
    mutationFn: () =>
      changePassword(accessToken, {
        currentPassword,
        newPassword,
      }),
    onSuccess: () => {
      setFormSuccess('Password changed successfully. Please sign in again with your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFormError(null);

      clearSession();
      queryClient.clear();

      setTimeout(() => {
        router.push('/login?reason=password_changed');
      }, 1500);
    },
    onError: (err: unknown) => {
      setFormError(
        err instanceof Error ? err.message : 'Failed to change password. Verify your current password.',
      );
    },
  });

  // Mutation: Revoke Single Session
  const revokeSingleMutation = useMutation({
    mutationFn: (sessionId: string) => revokeSession(accessToken, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setActionNotice('Session revoked successfully.');
      setTimeout(() => setActionNotice(null), 3500);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to revoke session.');
    },
  });

  // Mutation: Revoke Other Sessions
  const revokeOthersMutation = useMutation({
    mutationFn: () => revokeOtherSessions(accessToken),
    onSuccess: (res) => {
      setConfirmRevokeOthersOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setActionNotice(res.message || 'All other browser sessions have been signed out.');
      setTimeout(() => setActionNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setActionNotice(err instanceof Error ? err.message : 'Failed to revoke other sessions.');
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

  const getDeviceIcon = (deviceName: string) => {
    const lower = deviceName.toLowerCase();
    if (lower.includes('iphone') || lower.includes('android') || lower.includes('mobile')) {
      return <Smartphone size={18} className="text-blue-600 shrink-0" />;
    }
    if (lower.includes('windows') || lower.includes('mac') || lower.includes('linux')) {
      return <Laptop size={18} className="text-slate-700 shrink-0" />;
    }
    return <Globe size={18} className="text-slate-500 shrink-0" />;
  };

  const sessions = sessionsData || [];
  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        backHref={`${basePath}/settings`}
        backLabel="Back to Settings"
        eyebrow="CREDENTIAL SECURITY"
        title="Security & Active Sessions"
        description="Update your account password, inspect authenticated browser sessions, and review recent audit activity."
      />

      {user?.needPasswordChange ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900 m-0">Mandatory Password Update Required</p>
            <p className="text-slate-600 m-0 mt-0.5">
              Your account currently requires an initial or reset password update. Please create a strong,
              institutional-grade password before accessing full dashboard features.
            </p>
          </div>
        </div>
      ) : null}

      {actionNotice ? (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      {formSuccess ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      ) : null}

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      {/* 1. PASSWORD UPDATE FORM */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0">Change Account Password</h3>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Passwords must contain at least 12 characters including uppercase, lowercase, numbers, and symbols.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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

          {newPassword.length > 0 ? (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 animate-in fade-in">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 m-0 mb-1">
                Password Security Requirements
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}
                >
                  {hasMinLength ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                  <span>Minimum 12 characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}
                >
                  {hasUpper ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                  <span>Uppercase letter (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}
                >
                  {hasLower ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                  <span>Lowercase letter (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}
                >
                  {hasNumber ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                  <span>Numeric digit (0-9)</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${hasSymbol ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}
                >
                  {hasSymbol ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                  <span>Special symbol (!@#$%^&*)</span>
                </div>
                {confirmPassword.length > 0 ? (
                  <div
                    className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 font-semibold' : 'text-red-500'}`}
                  >
                    {passwordsMatch ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
                    <span>Passwords match</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <Input
            label="Confirm New Password *"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end">
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

      {/* 2. REAL ACTIVE SESSIONS & DEVICE MANAGEMENT */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0">Active Browser Sessions & Devices</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Manage your active authenticated sessions across all recognized browsers and workstations.
            </p>
          </div>

          {otherSessionsCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmRevokeOthersOpen(true)}
              disabled={revokeOthersMutation.isPending}
              className="text-xs text-red-600 border-red-200 hover:bg-red-50 shrink-0"
            >
              <LogOut size={13} /> Sign Out Other Sessions ({otherSessionsCount})
            </Button>
          ) : null}
        </div>

        {confirmRevokeOthersOpen ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 m-0">Sign Out All Other Sessions?</p>
                <p className="text-xs text-amber-800 m-0 mt-0.5">
                  This will immediately terminate all active sessions on other laptops, desktops, and mobile devices.
                  You will stay signed in on this current browser.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmRevokeOthersOpen(false)}
                disabled={revokeOthersMutation.isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => revokeOthersMutation.mutate()}
                disabled={revokeOthersMutation.isPending}
                className="text-xs"
              >
                {revokeOthersMutation.isPending ? 'Signing Out…' : 'Confirm Sign Out'}
              </Button>
            </div>
          </div>
        ) : null}

        {isSessionsLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading active browser sessions…</div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No active browser sessions registered.</div>
        ) : (
          <div className="space-y-3">
            {sessions.map((sess: SessionItem) => (
              <div
                key={sess.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  sess.isCurrent ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs mt-0.5">
                    {getDeviceIcon(sess.deviceName)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{sess.deviceName}</span>
                      {sess.isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={11} /> This Device
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-slate-500 m-0">
                      IP: <span className="font-mono text-slate-700">{sess.maskedIp}</span> · Last active:{' '}
                      <span className="text-slate-700 font-medium">
                        {formatDate(sess.lastActiveAt, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                  </div>
                </div>

                {!sess.isCurrent ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeSingleMutation.mutate(sess.id)}
                    disabled={revokeSingleMutation.isPending}
                    className="text-xs text-slate-600 hover:text-red-600 hover:border-red-200 shrink-0 self-end sm:self-center"
                  >
                    <LogOut size={13} /> Revoke
                  </Button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 self-end sm:self-center">
                    Current Session
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. RECENT LOGIN & SECURITY ACTIVITY AUDIT TABLE */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0">Recent Login & Credential Activity</h3>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Immutable security event log documenting authorized sessions, password updates, and failed access attempts.
          </p>
        </div>

        {isHistoryLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading security log…</div>
        ) : !historyData || historyData.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">No recent security events recorded.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Device / Platform</th>
                  <th className="py-2.5 px-3">Masked IP</th>
                  <th className="py-2.5 px-3 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyData.map((item: LoginHistoryItem) => {
                  const isSuccess = item.result === 'SUCCESS';
                  const isPasswordChange = item.action === 'PASSWORD_CHANGED';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3">
                        {isPasswordChange ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <Key size={11} /> Password Changed
                          </span>
                        ) : isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <ShieldCheck size={11} /> Authorized Login
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <XCircle size={11} /> Failed Attempt
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.deviceName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{item.maskedIp}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {formatDate(item.createdAt, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
