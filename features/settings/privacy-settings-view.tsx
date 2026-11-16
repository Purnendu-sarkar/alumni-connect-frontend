'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Globe,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Search,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import {
  getMyPrivacy,
  updateMyPrivacy,
  type PrivacyScope,
  type PrivacySettingPayload,
} from '@/lib/api/privacy.api';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface PrivacySettingsViewProps {
  currentRole: UserRole;
  basePath: string;
}

const SCOPE_OPTIONS: { value: PrivacyScope; label: string; description: string }[] = [
  {
    value: 'PUBLIC',
    label: 'Public',
    description: 'Visible to all visitors including unauthenticated users',
  },
  {
    value: 'ALL_MEMBERS',
    label: 'Campus Community',
    description: 'Visible to all authenticated students, alumni, and faculty',
  },
  {
    value: 'CONNECTIONS_ONLY',
    label: 'Connections Only',
    description: 'Visible strictly to your approved 1-on-1 connections',
  },
  {
    value: 'ONLY_ME',
    label: 'Only Me',
    description: 'Hidden from everyone except yourself and university administrators',
  },
];

export function PrivacySettingsView({ currentRole, basePath }: PrivacySettingsViewProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState<PrivacySettingPayload>({
    profileVisibility: 'ALL_MEMBERS',
    emailVisibility: 'CONNECTIONS_ONLY',
    phoneVisibility: 'CONNECTIONS_ONLY',
    locationVisibility: 'ALL_MEMBERS',
    careerVisibility: 'ALL_MEMBERS',
    educationVisibility: 'ALL_MEMBERS',
    skillsVisibility: 'ALL_MEMBERS',
    connectionsVisibility: 'CONNECTIONS_ONLY',
    mentorshipVisibility: 'ALL_MEMBERS',
    searchVisibility: 'ALL_MEMBERS',
    messagingPermission: 'CONNECTIONS_ONLY',
  });

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: privacyData, isLoading, isError, error } = useQuery({
    queryKey: ['privacy', 'me'],
    queryFn: async () => {
      const res = await getMyPrivacy(accessToken);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to fetch privacy settings');
      }
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    if (privacyData) {
      setFormState({
        profileVisibility: privacyData.profileVisibility || 'ALL_MEMBERS',
        emailVisibility: privacyData.emailVisibility || 'CONNECTIONS_ONLY',
        phoneVisibility: privacyData.phoneVisibility || 'CONNECTIONS_ONLY',
        locationVisibility: privacyData.locationVisibility || 'ALL_MEMBERS',
        careerVisibility: privacyData.careerVisibility || 'ALL_MEMBERS',
        educationVisibility: privacyData.educationVisibility || 'ALL_MEMBERS',
        skillsVisibility: privacyData.skillsVisibility || 'ALL_MEMBERS',
        connectionsVisibility: privacyData.connectionsVisibility || 'CONNECTIONS_ONLY',
        mentorshipVisibility: privacyData.mentorshipVisibility || 'ALL_MEMBERS',
        searchVisibility: privacyData.searchVisibility || 'ALL_MEMBERS',
        messagingPermission: privacyData.messagingPermission || 'CONNECTIONS_ONLY',
      });
    }
  }, [privacyData]);

  const updateMutation = useMutation({
    mutationFn: async (payload: PrivacySettingPayload) => {
      const res = await updateMyPrivacy(accessToken, payload);
      if (!res.success) {
        throw new Error(res.message || 'Failed to update privacy settings');
      }
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['privacy', 'me'], updated);
      setNotice({ type: 'success', message: 'Privacy preferences saved successfully.' });
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setNotice({ type: 'error', message: getApiErrorMessage(err, 'Failed to save privacy preferences.') });
      setTimeout(() => setNotice(null), 5000);
    },
  });

  const handleChange = (field: keyof PrivacySettingPayload, value: PrivacyScope) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formState);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        backHref={`${basePath}/settings`}
        backLabel="Back to Settings"
        eyebrow="PRIVACY & VISIBILITY CONTROLS"
        title="Privacy Preferences"
        description="Configure granular visibility scopes for your contact info, academic history, professional details, and inbound messages."
      />

      {notice ? (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      ) : null}

      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : isError ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
          <p className="font-bold m-0 mb-1">Failed to load privacy preferences</p>
          <p className="m-0 text-rose-600">{getApiErrorMessage(error, 'An unexpected error occurred.')}</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section: Profile & Discovery */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <Globe size={16} className="text-blue-600" />
                Profile & Directory Discovery
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Control how and where your public identity appears across the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Overall Profile Visibility
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Controls visibility of your full profile view.</p>
                <select
                  value={formState.profileVisibility}
                  onChange={(e) => handleChange('profileVisibility', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Directory Search Indexing
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Controls discoverability in directory searches.</p>
                <select
                  value={formState.searchVisibility}
                  onChange={(e) => handleChange('searchVisibility', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.value})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Contact & Communications */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <Lock size={16} className="text-blue-600" />
                Contact Information & Messaging
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Protect your personal contact data and restrict unsolicited messages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Email Visibility
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Who can see your verified institutional email.</p>
                <select
                  value={formState.emailVisibility}
                  onChange={(e) => handleChange('emailVisibility', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Phone Number Visibility
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Who can view your contact telephone number.</p>
                <select
                  value={formState.phoneVisibility}
                  onChange={(e) => handleChange('phoneVisibility', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Direct Messaging Scope
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Who can initiate 1-on-1 private messaging.</p>
                <select
                  value={formState.messagingPermission}
                  onChange={(e) => handleChange('messagingPermission', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Academic & Professional Details */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <Shield size={16} className="text-blue-600" />
                Academic & Professional Attributes
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Configure field-level display permissions for career history and skills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Career & Employment History
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Company name, designation, and work experience.</p>
                <select
                  value={formState.careerVisibility}
                  onChange={(e) => handleChange('careerVisibility', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Education & Degree History
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Degree records, batch, and academic credentials.</p>
                <select
                  value={formState.educationVisibility}
                  onChange={(e) => handleChange('educationVisibility', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Technical & Domain Skills
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Endorsed skills and technical expertise tags.</p>
                <select
                  value={formState.skillsVisibility}
                  onChange={(e) => handleChange('skillsVisibility', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Geographic Location / City
                </label>
                <p className="text-[11px] text-slate-500 mb-2">City and country of residence.</p>
                <select
                  value={formState.locationVisibility}
                  onChange={(e) => handleChange('locationVisibility', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Mentorship & Connections */}
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                Social Graph & Mentorship
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Control who can view your network connections and mentorship capacity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Connections List Visibility
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Who can see your network list of connections.</p>
                <select
                  value={formState.connectionsVisibility}
                  onChange={(e) => handleChange('connectionsVisibility', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Mentorship Status Visibility
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Who can see your availability for mentorship.</p>
                <select
                  value={formState.mentorshipVisibility}
                  onChange={(e) => handleChange('mentorshipVisibility', e.target.value as PrivacyScope)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="px-6"
            >
              <Save size={14} className={updateMutation.isPending ? 'animate-spin' : ''} />
              {updateMutation.isPending ? 'Saving Settings…' : 'Save Privacy Settings'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}