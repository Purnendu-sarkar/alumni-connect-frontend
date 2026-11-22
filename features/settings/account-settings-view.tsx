'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Lock,
  Save,
  ShieldAlert,
  Trash2,
  User,
  UserX,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { PageHeader } from '@/components/dashboard/page-header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { updateMe } from '@/lib/api/user.api';
import {
  getAccountSummary,
  requestDataExport,
  deactivateAccount,
  deleteAccount,
  type DataExportReceipt,
} from '@/lib/api/account.api';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AccountSettingsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AccountSettingsView({ currentRole, basePath }: AccountSettingsViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  // Profile info state
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal dialog states
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Deactivate form state
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  // Delete form state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch account summary
  const {
    data: accountSummary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['account-summary'],
    queryFn: async () => {
      const res = await getAccountSummary(accessToken);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to load account summary');
      }
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  // Save display name mutation
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
      setFormError(getApiErrorMessage(err, 'Failed to save account settings.'));
    },
  });

  // Data export mutation
  const exportMutation = useMutation({
    mutationFn: () => requestDataExport(accessToken),
    onSuccess: (res) => {
      if (res.data?.data) {
        const jsonStr = JSON.stringify(res.data.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `alumni-connect-data-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      refetchSummary();
      setNotice('Personal data archive generated and downloaded successfully.');
      setFormError(null);
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setFormError(getApiErrorMessage(err, 'Failed to generate personal data export.'));
    },
  });

  // Deactivate account mutation
  const deactivateMutation = useMutation({
    mutationFn: () => deactivateAccount(accessToken, deactivatePassword),
    onSuccess: () => {
      setDeactivateModalOpen(false);
      clearSession();
      router.push('/login?notice=account-deactivated');
    },
    onError: (err: unknown) => {
      setDeactivateError(getApiErrorMessage(err, 'Failed to deactivate account.'));
    },
  });

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(accessToken, deletePassword, deleteConfirmText),
    onSuccess: () => {
      setDeleteModalOpen(false);
      clearSession();
      router.push('/login?notice=account-deletion-scheduled');
    },
    onError: (err: unknown) => {
      setDeleteError(getApiErrorMessage(err, 'Failed to schedule account deletion.'));
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

  const handleOpenDeactivateModal = () => {
    setDeactivatePassword('');
    setDeactivateError(null);
    setDeactivateModalOpen(true);
  };

  const handleOpenDeleteModal = () => {
    setDeletePassword('');
    setDeleteConfirmText('');
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        backHref={`${basePath}/settings`}
        backLabel="Back to Settings"
        eyebrow="ACCOUNT GOVERNANCE & ARCHIVE"
        title="Account Details & Lifecycle"
        description="Manage your institutional identification, export portable account data archives, or manage account deactivation."
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      {/* 1. BASIC INFORMATION */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0">Basic Profile Identification</h3>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            Your display name is visible across the directory and community showcases.
          </p>
        </div>

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

      {/* 2. PERSONAL DATA PORTABILITY ARCHIVE (GDPR) */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
              <Download size={16} className="text-blue-600" />
              Personal Data Portability Archive
            </h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Export a sanitized, complete JSON archive containing your profile, network connections, mentorships, applications, and settings.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="shrink-0 text-xs"
          >
            <Download size={13} className={exportMutation.isPending ? 'animate-bounce' : ''} />
            {exportMutation.isPending ? 'Compiling Archive…' : 'Download My Data (JSON)'}
          </Button>
        </div>

        {/* Recent Data Export Receipts */}
        {accountSummary?.recentExports && accountSummary.recentExports.length > 0 ? (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 m-0 flex items-center gap-1.5">
              <Clock size={13} className="text-slate-500" />
              Recent Export Receipts (24-Hour Expiry)
            </h4>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Receipt ID</th>
                    <th className="py-2 px-3">Generated At</th>
                    <th className="py-2 px-3 text-right">Expires At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accountSummary.recentExports.map((item: DataExportReceipt) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={11} /> {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                        {item.id.slice(0, 16)}…
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {formatDate(item.createdAt, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        {formatDate(item.expiresAt, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. DANGER ZONE (ACCOUNT LIFECYCLE) */}
      <div className="p-6 bg-white rounded-xl border border-rose-200 shadow-xs space-y-4">
        <div className="border-b border-rose-100 pb-3">
          <h3 className="text-sm font-bold text-rose-900 m-0 flex items-center gap-2">
            <ShieldAlert size={16} className="text-rose-600" />
            Account Lifecycle & Danger Zone
          </h3>
          <p className="text-xs text-rose-700 m-0 mt-0.5">
            Actions performed here immediately restrict institutional directory visibility or schedule permanent data purging.
          </p>
        </div>

        <div className="space-y-4 divide-y divide-slate-100 text-xs">
          {/* Deactivate Option */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-800 m-0 flex items-center gap-1.5">
                <UserX size={14} className="text-amber-600" />
                Deactivate Account
              </h4>
              <p className="text-slate-500 m-0">
                Hide your profile from campus search and terminate all active sessions. You can reactivate anytime by signing back in.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenDeactivateModal}
              className="shrink-0 text-amber-700 border-amber-300 hover:bg-amber-50"
            >
              Deactivate Account
            </Button>
          </div>

          {/* Delete Option */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="font-bold text-rose-800 m-0 flex items-center gap-1.5">
                <Trash2 size={14} className="text-rose-600" />
                Delete Account (30-Day Grace Period)
              </h4>
              <p className="text-slate-500 m-0">
                Permanently purge your account. Enforces a 30-day quarantine period, immediately revokes sessions, and closes open job postings.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleOpenDeleteModal}
              className="shrink-0"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL: CONFIRM DEACTIVATION */}
      <Dialog open={deactivateModalOpen} onOpenChange={setDeactivateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-amber-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" />
              Confirm Account Deactivation
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed">
              Your profile, directory listing, and contact details will be immediately hidden from students and alumni. All your active browser sessions will be terminated. You can reactivate your account at any time by simply logging back in with your institutional credentials.
            </DialogDescription>
          </DialogHeader>

          {deactivateError ? <FormAlert>{deactivateError}</FormAlert> : null}

          <div className="space-y-3 py-2 text-xs">
            <PasswordInput
              label="Enter Current Password to Confirm *"
              value={deactivatePassword}
              onChange={(e) => setDeactivatePassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeactivateModalOpen(false)}
              disabled={deactivateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => deactivateMutation.mutate()}
              disabled={deactivateMutation.isPending || !deactivatePassword}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {deactivateMutation.isPending ? 'Deactivating…' : 'Confirm Deactivation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: CONFIRM DELETION */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose-900 flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-600" />
              Schedule Permanent Account Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-xs leading-relaxed">
              This action initiates a mandatory 30-day grace period under institutional data retention governance. During this period:
            </DialogDescription>
          </DialogHeader>

          <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">
            <li>Your profile and directory listings are permanently suppressed.</li>
            <li>All open jobs posted by your account are immediately closed.</li>
            <li>All active browser sessions across all devices are terminated.</li>
            <li>After 30 days, personal data is permanently scrubbed.</li>
          </ul>

          {deleteError ? <FormAlert>{deleteError}</FormAlert> : null}

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Type <span className="font-mono text-rose-600">DELETE</span> to confirm *
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                required
              />
            </div>

            <PasswordInput
              label="Enter Current Password *"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={
                deleteMutation.isPending ||
                deleteConfirmText !== 'DELETE' ||
                !deletePassword
              }
            >
              {deleteMutation.isPending ? 'Scheduling Purge…' : 'Permanently Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
