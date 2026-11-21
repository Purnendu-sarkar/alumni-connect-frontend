'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  MapPin,
  Save,
  Send,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { RichTextEditor } from '@/components/shared/rich-text-editor';
import {
  createJob,
  getOwnerJobDetail,
  updateJob,
  type CreateJobInput,
} from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface JobCreateFormProps {
  currentRole: UserRole;
  basePath: string;
  editJobId?: string;
}

const CATEGORIES = [
  'Software Engineering',
  'Product & Design',
  'Data & AI',
  'Business & Marketing',
  'Finance & Accounting',
  'Operations',
  'General',
];

const EMPLOYMENT_TYPES = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Remote', value: 'REMOTE' },
  { label: 'Freelance', value: 'FREELANCE' },
];

const WORK_MODES = [
  { label: 'On-site', value: 'ON_SITE' },
  { label: 'Hybrid', value: 'HYBRID' },
  { label: 'Remote', value: 'REMOTE' },
];

const EXPERIENCE_LEVELS = [
  { label: 'Any / Open', value: 'ANY' },
  { label: 'Entry Level', value: 'ENTRY' },
  { label: 'Mid Level', value: 'MID' },
  { label: 'Senior Level', value: 'SENIOR' },
  { label: 'Lead / Executive', value: 'LEAD' },
];

export function JobCreateForm({ currentRole, basePath, editJobId }: JobCreateFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const isEditing = Boolean(editJobId);

  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState(user?.department ? `${user.department} Network Partner` : '');
  const [category, setCategory] = useState('Software Engineering');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [experienceLevel, setExperienceLevel] = useState('ENTRY');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [salaryCurrency, setSalaryCurrency] = useState('BDT');
  const [deadline, setDeadline] = useState('');
  const [referralAvailable, setReferralAvailable] = useState(true);
  const [requireResume, setRequireResume] = useState(true);
  const [requireCoverLetter, setRequireCoverLetter] = useState(false);
  const [applicationUrl, setApplicationUrl] = useState('');
  const [applicationEmail, setApplicationEmail] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing job for edit mode
  const existingJobQuery = useQuery({
    queryKey: ['owner-job', editJobId],
    queryFn: () => getOwnerJobDetail(editJobId!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingJobQuery.data?.data) {
      const j = existingJobQuery.data.data;
      setTitle(j.title || '');
      setCompany(j.company || '');
      setCategory(j.category || 'Software Engineering');
      setEmploymentType(j.employmentType || 'FULL_TIME');
      setWorkMode(j.workMode || 'HYBRID');
      setExperienceLevel(j.experienceLevel || 'ENTRY');
      setLocation(j.location || '');
      setSalaryMin(j.salaryMin ? String(j.salaryMin) : '');
      setSalaryMax(j.salaryMax ? String(j.salaryMax) : '');
      setSalaryCurrency(j.salaryCurrency || 'BDT');
      setDeadline(j.deadline ? new Date(j.deadline).toISOString().split('T')[0] : '');
      setReferralAvailable(j.referralAvailable ?? true);
      setRequireResume(j.requireResume ?? true);
      setRequireCoverLetter(j.requireCoverLetter ?? false);
      setApplicationUrl(j.applicationUrl || '');
      setApplicationEmail(j.applicationEmail || '');
      setDescription(j.description || '');
      setRequirements(j.requirements || '');
    }
  }, [existingJobQuery.data]);

  const handleSubmit = async (submitNow: boolean) => {
    setFormError(null);

    if (!title.trim() || title.trim().length < 5) {
      setFormError('Job title must be at least 5 characters.');
      return;
    }
    if (!company.trim()) {
      setFormError('Company or organization name is required.');
      return;
    }
    if (!description.trim() || description.trim().length < 30) {
      setFormError('Job description must be at least 30 characters.');
      return;
    }

    const payload: CreateJobInput = {
      title: title.trim(),
      company: company.trim(),
      category,
      employmentType,
      workMode,
      experienceLevel,
      location: location.trim() || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryCurrency,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      referralAvailable,
      requireResume,
      requireCoverLetter,
      applicationUrl: applicationUrl.trim() || undefined,
      applicationEmail: applicationEmail.trim() || undefined,
      description: description.trim(),
      requirements: requirements.trim() || undefined,
      submitNow,
    };

    setIsSubmitting(true);
    try {
      if (isEditing && editJobId) {
        await updateJob(accessToken, editJobId, payload);
      } else {
        await createJob(accessToken, payload);
      }

      queryClient.invalidateQueries({ queryKey: ['my-posted-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['published-jobs'] });
      router.push(`${basePath}/jobs/my-jobs?saved=true`);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save job listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentlyPublished = existingJobQuery.data?.data?.status === 'PUBLISHED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        backHref={`${basePath}/jobs/my-jobs`}
        backLabel="Back to My Jobs"
        eyebrow="CAMPUS RECRUITMENT DESK"
        title={isEditing ? `Edit Job: ${title || 'Opportunity'}` : 'Post a Career Opportunity'}
        description="Share verified career openings, internships, or corporate referrals directly with university students and graduates."
      />

      {isCurrentlyPublished && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>Security Notice:</strong> This listing is currently published live on the campus board. Modifying critical fields (title, company, compensation, or description) will automatically trigger institutional re-review and revert the status to <em>Under Review</em> to prevent bait-and-switch modifications.
          </div>
        </div>
      )}

      {formError && <FormAlert>{formError}</FormAlert>}

      <Card className="p-6 md:p-8 space-y-6 shadow-xs">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 m-0">
            1. Role & Hiring Organization
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Position Title *"
              placeholder="e.g. Junior Backend Engineer (Go/Node.js)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="Company or Organization *"
              placeholder="e.g. Brain Station 23 / bKash"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Functional Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Employment Type *
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Mode *
              </label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {WORK_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location & Compensation */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 m-0">
            2. Location, Experience & Compensation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Location (City / Office Address)"
              placeholder="e.g. Dhaka, Bangladesh (Gulshan 2)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp.value} value={exp.value}>
                    {exp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Minimum Salary (Optional)"
              type="number"
              placeholder="e.g. 50000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />

            <Input
              label="Maximum Salary (Optional)"
              type="number"
              placeholder="e.g. 80000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Currency
              </label>
              <select
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="BDT">BDT (Tk)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Application Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <Input
              label="External Application Link (Optional)"
              placeholder="https://company.careers/job/123"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Requirements & Description */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 m-0">
            3. Job Description & Requirements
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Job Description & Responsibilities *
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Outline what the candidate will be doing day-to-day, team dynamics, projects, and learning opportunities…"
              minHeight="180px"
              required
              helperText="Rich formatting supported. Switch between Write and Preview tabs to review."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Requirements, Coursework & Skills
            </label>
            <RichTextEditor
              value={requirements}
              onChange={setRequirements}
              placeholder="Specific programming languages, framework competencies, CGPA recommendations, thesis topics, or communication skills…"
              minHeight="160px"
              helperText="Use bullet lists or bold tags to cleanly structure qualifications."
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 m-0">
            4. Applicant Protections & Referral Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={referralAvailable}
                onChange={(e) => setReferralAvailable(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" /> Alumni Referral
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  I will personally review and refer strong campus applicants to our hiring team.
                </span>
              </div>
            </label>

            <label className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={requireResume}
                onChange={(e) => setRequireResume(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Require PDF Resume</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Mandatory PDF upload (encrypted and authenticated).
                </span>
              </div>
            </label>

            <label className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={requireCoverLetter}
                onChange={(e) => setRequireCoverLetter(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Require Cover Note</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Require students to explain their interest and relevant projects.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            <Save size={14} /> Save as Draft
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            <Send size={14} /> {isEditing ? 'Save & Submit Changes' : 'Submit for Moderation'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
