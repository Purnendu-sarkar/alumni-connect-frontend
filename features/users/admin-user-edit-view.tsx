'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Save, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { demoAlumni } from '@/features/shared/demo-data';
import type { UserRole, VerificationStatus } from '@/types/domain';

interface AdminUserEditViewProps {
  id: string;
  currentRole: UserRole;
  basePath: string;
}

export function AdminUserEditView({ id, currentRole, basePath }: AdminUserEditViewProps) {
  const member = demoAlumni.find((a) => a.id === id);

  const [name, setName] = useState(member?.name || 'Academic Member');
  const [role, setRole] = useState<UserRole>('ALUMNI');
  const [department, setDepartment] = useState(member?.department || 'Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState(String(member?.graduationYear || '2022'));
  const [studentId, setStudentId] = useState(`NWU-${member?.batch || '2020'}-001`);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(`Record #${id} updated successfully.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href={`${basePath}/users/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Member Profile
        </Link>
        <PageHeader
          eyebrow="ADMINISTRATIVE EDIT"
          title={`Edit User: ${name}`}
          description="Update institutional affiliation, campus role, or graduation record details."
        />
      </div>

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      <form onSubmit={handleSave} className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Platform Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="STUDENT">Student</option>
            <option value="ALUMNI">Alumni</option>
            <option value="MODERATOR">Moderator</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Graduation Year
            </label>
            <Input
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Student / ID Card Number
          </label>
          <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`${basePath}/users/${id}`}>Cancel</Link>
          </Button>
          <Button type="submit" size="sm" variant="primary">
            <Save size={14} /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
