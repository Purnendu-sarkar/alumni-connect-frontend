'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { demoAlumni } from '@/features/shared/demo-data';
import type { UserRole, VerificationStatus } from '@/types/domain';

interface AdminUserDetailViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function AdminUserDetailView({ id, currentRole, basePath }: AdminUserDetailViewProps) {
  const member = demoAlumni.find((a) => a.id === id);

  const [isActive, setIsActive] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    member ? (member.verified ? 'APPROVED' : 'PENDING') : 'APPROVED'
  );
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const name = member?.name || 'Academic Member';
  const role: UserRole = 'ALUMNI';
  const email = `${member?.id || 'alumni'}@campus.edu`;
  const department = member?.department || 'Computer Science & Engineering';
  const graduationYear = member?.graduationYear || '2022';
  const currentCompany = member?.currentCompany || 'Technology Inc.';
  const currentRoleTitle = member?.position || 'Software Engineer';
  const studentId = `NWU-${member?.batch || '2020'}-001`;

  const handleToggleSuspension = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    setConfirmSuspend(false);
    setNotice(nextState ? 'User account reactivated.' : 'User account suspended from platform.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleVerify = (status: VerificationStatus) => {
    setVerificationStatus(status);
    setNotice(`Verification status updated to ${status}.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href={`${basePath}/users`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft size={14} /> Back to User Directory
        </Link>
        <PageHeader
          eyebrow={`USER RECORD #${id.toUpperCase()}`}
          title={name}
          badge={
            <div className="flex items-center gap-2">
              <StatusBadge status={role} />
              <StatusBadge status={verificationStatus} />
              {!isActive ? <Badge variant="error">Suspended</Badge> : null}
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" asChild>
                <Link href={`${basePath}/users/${id}/edit`}>
                  <Edit size={14} /> Edit Record
                </Link>
              </Button>
              <Button
                size="sm"
                variant={isActive ? 'destructive' : 'primary'}
                onClick={() => setConfirmSuspend(true)}
              >
                <Ban size={14} /> {isActive ? 'Suspend User' : 'Reactivate User'}
              </Button>
            </div>
          }
        />
      </div>

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Institutional Credential Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Primary Email</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Student / ID Number</span>
                <span className="font-semibold text-slate-800 font-mono mt-0.5 block">{studentId}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Department / Faculty</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{department}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Graduation / Batch Year</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{graduationYear}</span>
              </div>
            </div>

            {role === 'ALUMNI' ? (
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Current Employment Profile</h4>
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                  <Building2 size={18} className="text-slate-400 shrink-0" />
                  <div>
                    <strong className="text-slate-900 text-xs block">{currentRoleTitle}</strong>
                    <span className="text-[11px] text-slate-500">{currentCompany}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Verification Controls</h3>
            <p className="text-xs text-slate-600">
              Update institutional trust verification status to grant or revoke official badge.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                variant={verificationStatus === 'APPROVED' ? 'secondary' : 'primary'}
                onClick={() => handleVerify('APPROVED')}
                disabled={verificationStatus === 'APPROVED'}
              >
                <CheckCircle2 size={14} /> Approve Verification
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleVerify('REJECTED')}
                disabled={verificationStatus === 'REJECTED'}
              >
                Reject Verification
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 text-center">
            <Avatar name={name} className="w-20 h-20 text-2xl mx-auto shadow-sm" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 m-0">{name}</h4>
              <p className="text-xs text-slate-500 m-0 mt-0.5">{role}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-left space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Account Status</span>
                <span className={isActive ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                  {isActive ? 'Active · In Good Standing' : 'Suspended'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Joined Platform</span>
                <span className="text-slate-700">October 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmSuspend}
        onClose={() => setConfirmSuspend(false)}
        title={isActive ? 'Confirm User Suspension' : 'Reactivate User Account'}
        description={
          isActive
            ? `Are you sure you want to suspend ${name}? The user will be unable to log in, interact in directory, or apply to opportunities.`
            : `Are you sure you want to reactivate ${name}? The user will regain access to platform services.`
        }
        confirmLabel={isActive ? 'Suspend User' : 'Reactivate User'}
        variant={isActive ? 'destructive' : 'primary'}
        onConfirm={handleToggleSuspension}
      />
    </div>
  );
}
