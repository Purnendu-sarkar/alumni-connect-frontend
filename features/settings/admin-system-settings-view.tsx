'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Save, Server, Shield, Sliders } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import {
  getAdminSettings,
  updateAdminSettings,
  type AdminSystemSettings,
} from '@/lib/api/admin.api';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AdminSystemSettingsViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function AdminSystemSettingsView({ currentRole, basePath }: AdminSystemSettingsViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [universityName, setUniversityName] = useState(user?.university?.name || 'North Western University');
  const [domain, setDomain] = useState(user?.university?.domain || 'nwu.ac.bd');
  const [allowedDomainsStr, setAllowedDomainsStr] = useState('nwu.ac.bd');
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [requireAlumniVerification, setRequireAlumniVerification] = useState(true);
  const [moderatorAutoApproval, setModeratorAutoApproval] = useState(false);
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState(60);
  const [maxActiveMentees, setMaxActiveMentees] = useState(5);
  const [allowStudentJobApply, setAllowStudentJobApply] = useState(true);
  const [allowAlumniMentorship, setAllowAlumniMentorship] = useState(true);

  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch settings from database via API
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await getAdminSettings(accessToken);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to load system settings');
      }
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    if (settingsData) {
      setUniversityName(settingsData.universityName || 'North Western University');
      setDomain(settingsData.domain || 'nwu.ac.bd');
      setAllowedDomainsStr(
        Array.isArray(settingsData.allowedEmailDomains)
          ? settingsData.allowedEmailDomains.join(', ')
          : 'nwu.ac.bd'
      );
      setRequireEmailVerification(Boolean(settingsData.requireEmailVerification));
      setRequireAlumniVerification(Boolean(settingsData.requireAlumniVerification));
      setModeratorAutoApproval(Boolean(settingsData.moderatorAutoApproval));
      setSessionTimeoutMin(settingsData.sessionTimeoutMin || 60);
      setMaxActiveMentees(settingsData.maxActiveMentees || 5);
      setAllowStudentJobApply(settingsData.allowStudentJobApply !== false);
      setAllowAlumniMentorship(settingsData.allowAlumniMentorship !== false);
    }
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<AdminSystemSettings>) => {
      const res = await updateAdminSettings(accessToken, payload);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to update system settings');
      }
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin-settings'], updated);
      setNotice('Platform governance configurations applied and synchronized with database.');
      setFormError(null);
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setFormError(getApiErrorMessage(err, 'Failed to update system settings.'));
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setFormError(null);

    const parsedAllowedDomains = allowedDomainsStr
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0);

    const payload: Partial<AdminSystemSettings> = {
      universityName: universityName.trim(),
      domain: domain.trim().toLowerCase(),
      allowedEmailDomains: parsedAllowedDomains.length > 0 ? parsedAllowedDomains : [domain.trim().toLowerCase()],
      requireEmailVerification,
      requireAlumniVerification,
      moderatorAutoApproval,
      sessionTimeoutMin,
      maxActiveMentees,
      allowStudentJobApply,
      allowAlumniMentorship,
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        backHref={`${basePath}/settings`}
        backLabel="Back to Settings"
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

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      {isLoading ? (
        <CardGridSkeleton count={3} />
      ) : (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Campus Identity */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 m-0">
                Institutional Campus Identity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="University Institution Name *"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  required
                />

                <Input
                  label="Primary Authorized Campus Domain *"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  hint="Primary institutional internet domain."
                  required
                />
              </div>

              <Input
                label="Allowed Registration Email Domains (comma-separated)"
                value={allowedDomainsStr}
                onChange={(e) => setAllowedDomainsStr(e.target.value)}
                hint="Allow faculty and departmental subdomains, e.g.: nwu.ac.bd, cse.nwu.ac.bd"
              />
            </div>

            {/* Security Policies */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 m-0">
                Security & Authentication Policy
              </h4>

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
                  <p className="font-bold text-slate-800 m-0">Require Alumni Identity Verification</p>
                  <p className="text-slate-500 m-0 mt-0.5">Alumni accounts must be validated by moderators before accessing full directory.</p>
                </div>
                <input
                  type="checkbox"
                  checked={requireAlumniVerification}
                  onChange={(e) => setRequireAlumniVerification(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800 m-0">Moderator Queue Auto-Approval for Low Risk</p>
                  <p className="text-slate-500 m-0 mt-0.5">Automatically clear low-risk reported content if flagged by non-verified accounts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={moderatorAutoApproval}
                  onChange={(e) => setModeratorAutoApproval(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800 m-0">Super Admin Privileged Re-authentication Window</p>
                  <p className="text-slate-500 m-0 mt-0.5">Privileged administrative actions require password re-authentication after duration.</p>
                </div>
                <select
                  value={sessionTimeoutMin}
                  onChange={(e) => setSessionTimeoutMin(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value={15}>15 Minutes (Strict)</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>

            {/* Academic & Mentorship Policies */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-500 m-0">
                Career & Mentorship Program Rules
              </h4>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-bold text-slate-800 m-0">Maximum Active Mentees per Mentor</p>
                  <p className="text-slate-500 m-0 mt-0.5">Limit concurrent active mentorship pairings per alumni mentor.</p>
                </div>
                <select
                  value={maxActiveMentees}
                  onChange={(e) => setMaxActiveMentees(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  <option value={3}>3 Mentees</option>
                  <option value={5}>5 Mentees (Default)</option>
                  <option value={10}>10 Mentees</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800 m-0">Allow Student Direct Job Applications</p>
                  <p className="text-slate-500 m-0 mt-0.5">Permit enrolled students to submit job applications directly through the campus board.</p>
                </div>
                <input
                  type="checkbox"
                  checked={allowStudentJobApply}
                  onChange={(e) => setAllowStudentJobApply(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800 m-0">Enable Alumni Mentorship Program</p>
                  <p className="text-slate-500 m-0 mt-0.5">Allow alumni to offer mentorship capacity and accept student mentorship requests.</p>
                </div>
                <input
                  type="checkbox"
                  checked={allowAlumniMentorship}
                  onChange={(e) => setAllowAlumniMentorship(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" size="sm" disabled={saveMutation.isPending}>
                <Save size={14} className={saveMutation.isPending ? 'animate-spin' : ''} />
                {saveMutation.isPending ? 'Saving Configurations…' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
