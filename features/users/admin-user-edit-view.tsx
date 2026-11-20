'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Save,
  ShieldAlert,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { useDepartments } from '@/hooks/use-departments';
import {
  getAdminUserDetail,
  updateAdminUser,
  type AdminUserDetail,
  type UpdateAdminUserPayload,
} from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface AdminUserEditViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

interface AdminUserEditFormProps {
  user: AdminUserDetail;
  basePath: string;
  accessToken: string | null;
}

function AdminUserEditForm({ user, basePath, accessToken }: AdminUserEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { departments } = useDepartments();

  const initialDepartmentId =
    user.departmentId ||
    user.departmentRef?.id ||
    departments.find((d) => d.name === user.department)?.id ||
    '';

  const [name, setName] = useState(user.name);
  const [departmentId, setDepartmentId] = useState(initialDepartmentId);
  const [batch, setBatch] = useState(user.batch ?? '');
  const [graduationYear, setGraduationYear] = useState(user.graduationYear ?? '');
  const [studentId, setStudentId] = useState(user.studentId ?? '');
  const [academicId, setAcademicId] = useState(user.academicId ?? '');
  const [currentSemester, setCurrentSemester] = useState(user.currentSemester ?? '');
  const [expectedGraduationYear, setExpectedGraduationYear] = useState(
    user.expectedGraduationYear ?? '',
  );
  const [position, setPosition] = useState(user.position ?? '');
  const [currentCompany, setCurrentCompany] = useState(user.currentCompany ?? '');
  const [employmentStatus, setEmploymentStatus] = useState(user.employmentStatus ?? '');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const saveMutation = useMutation({
    mutationFn: (payload: UpdateAdminUserPayload) => updateAdminUser(accessToken, user.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', user.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-moderators'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-roles-overview'] });
      setFeedback({
        type: 'success',
        message: 'Institutional member record saved successfully.',
      });
      setTimeout(() => {
        router.push(`${basePath}/users/${user.id}`);
      }, 900);
    },
    onError: (err: unknown) => {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update user record.',
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (name.trim().length < 2) {
      setFeedback({
        type: 'error',
        message: 'Full name must be at least 2 characters.',
      });
      return;
    }

    const selectedDept = departments.find((d) => d.id === departmentId);

    saveMutation.mutate({
      name: name.trim(),
      departmentId: departmentId ? departmentId : null,
      department: selectedDept ? selectedDept.name : departmentId ? undefined : null,
      batch: batch.trim() || null,
      graduationYear: graduationYear.trim() || null,
      studentId: studentId.trim() || null,
      academicId: academicId.trim() || null,
      currentSemester: currentSemester.trim() || null,
      expectedGraduationYear: expectedGraduationYear.trim() || null,
      position: position.trim() || null,
      currentCompany: currentCompany.trim() || null,
      employmentStatus: employmentStatus.trim() || null,
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href={`${basePath}/users/${user.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Member Profile
        </Link>
        <PageHeader
          eyebrow={`ADMINISTRATIVE RECORD EDIT · #${user.id.slice(-8).toUpperCase()}`}
          title={`Edit Record: ${user.name}`}
          description="Update verified academic records, departmental affiliation, and career profile details."
          badge={
            <div className="flex items-center gap-2">
              <StatusBadge status={user.role.name} />
              <StatusBadge status={user.verificationStatus} />
            </div>
          }
        />
      </div>

      {feedback ? (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {feedback.type === 'error' ? (
            <ShieldAlert size={16} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      ) : null}

      <form
        onSubmit={handleSave}
        className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6"
      >
        {/* Read-only Identity Banner */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Institutional Email (Read-only)
            </span>
            <span className="font-mono font-semibold text-slate-800 mt-0.5 block">
              {user.email}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Assigned Role
            </span>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={user.role.name} />
              {(user.role.name === 'STUDENT' || user.role.name === 'ALUMNI') && (
                <Link
                  href={`${basePath}/users/${user.id}`}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Change role via profile →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Core Identity */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 m-0">
            Academic & Identity Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="admin-edit-name"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Full Name *
              </label>
              <Input
                id="admin-edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-department"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Academic Department
              </label>
              <select
                id="admin-edit-department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                <option value="">— Unassigned —</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} — {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="admin-edit-batch"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Batch / Cohort
              </label>
              <Input
                id="admin-edit-batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. 2022 or Spring-2023"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-student-id"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Student ID Number
              </label>
              <Input
                id="admin-edit-student-id"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 2021-1-60-042"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-academic-id"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Academic / Registration ID
              </label>
              <Input
                id="admin-edit-academic-id"
                value={academicId}
                onChange={(e) => setAcademicId(e.target.value)}
                placeholder="e.g. REG-2019-1042"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-grad-year"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Graduation Year
              </label>
              <Input
                id="admin-edit-grad-year"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g. 2024"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-expected-grad"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Expected Graduation Year
              </label>
              <Input
                id="admin-edit-expected-grad"
                value={expectedGraduationYear}
                onChange={(e) => setExpectedGraduationYear(e.target.value)}
                placeholder="e.g. 2027"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-semester"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Current Semester
              </label>
              <Input
                id="admin-edit-semester"
                value={currentSemester}
                onChange={(e) => setCurrentSemester(e.target.value)}
                placeholder="e.g. 7th Semester"
              />
            </div>
          </div>
        </div>

        {/* Career Profile */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 m-0">
            Career & Employment Standing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="admin-edit-position"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Current Position
              </label>
              <Input
                id="admin-edit-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-company"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Current Company
              </label>
              <Input
                id="admin-edit-company"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="e.g. Acme Labs"
              />
            </div>

            <div>
              <label
                htmlFor="admin-edit-employment"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Employment Status
              </label>
              <select
                id="admin-edit-employment"
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2.5 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              >
                <option value="">— Not specified —</option>
                <option value="EMPLOYED">Employed</option>
                <option value="SELF_EMPLOYED">Self-Employed / Founder</option>
                <option value="HIGHER_STUDIES">Pursuing Higher Studies</option>
                <option value="SEEKING">Open to Opportunities</option>
                <option value="STUDENT">Full-time Student</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`${basePath}/users/${user.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" size="sm" variant="primary" disabled={saveMutation.isPending}>
            <Save size={14} /> {saveMutation.isPending ? 'Saving Changes…' : 'Save Record Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function AdminUserEditView({ id, basePath }: AdminUserEditViewProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const userQuery = useQuery({
    queryKey: ['admin-user-detail', id, accessToken],
    queryFn: () => getAdminUserDetail(accessToken, id),
    enabled: Boolean(accessToken && id),
  });

  if (userQuery.isLoading) {
    return (
      <div className="max-w-3xl space-y-6 py-4 animate-pulse">
        <div className="h-5 w-36 bg-slate-200 rounded-md" />
        <div className="h-16 bg-slate-200 rounded-xl" />
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <div className="max-w-3xl space-y-6 py-4">
        <Link
          href={`${basePath}/users/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Member Profile
        </Link>
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-950 m-0">Failed to load user record</p>
              <p className="text-rose-700 m-0 mt-0.5">
                {userQuery.error instanceof Error
                  ? userQuery.error.message
                  : 'Unable to fetch member details from the server.'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={() => userQuery.refetch()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const user = userQuery.data?.data;
  if (!user) {
    return (
      <div className="max-w-3xl space-y-6 py-4">
        <EmptyState
          icon={ShieldAlert}
          title="Member record not found"
          description="This account could not be located within your institution."
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/users`}>Back to Directory</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <AdminUserEditForm
      key={`${user.id}-${user.updatedAt}`}
      user={user}
      basePath={basePath}
      accessToken={accessToken}
    />
  );
}
