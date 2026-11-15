'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { MediaUploader } from '@/components/media/media-uploader';
import { getMe, updateMe } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserProfile, UserRole } from '@/types/domain';

const profileFormSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(100),
  headline: z.string().max(150),
  bio: z.string().max(1000),
  location: z.string().max(100),
  phone: z.string().max(30),
  phonePublic: z.boolean(),
  linkedinUrl: z.string(),
  githubUrl: z.string(),
  websiteUrl: z.string(),
  department: z.string().max(100),
  batch: z.string().max(100),
  skillsStr: z.string(),

  // Student specific
  studentId: z.string().max(100),
  currentSemester: z.string().max(50),
  admissionYear: z.string().max(20),
  expectedGraduationYear: z.string().max(20),

  // Alumni specific
  graduationYear: z.string().max(20),
  academicId: z.string().max(100),
  currentCompany: z.string().max(100),
  position: z.string().max(100),
  employmentStatus: z.string().max(100),
  isMentorshipAvailable: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditViewProps {
  currentRole: UserRole;
  basePath: string;
}

export function ProfileEditView({ currentRole, basePath }: ProfileEditViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [avatarPublicId, setAvatarPublicId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['my-profile', accessToken],
    queryFn: () => getMe(accessToken),
    enabled: Boolean(accessToken),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      headline: '',
      bio: '',
      location: '',
      phone: '',
      phonePublic: false,
      linkedinUrl: '',
      githubUrl: '',
      websiteUrl: '',
      department: user?.department || '',
      batch: user?.batch || '',
      skillsStr: '',
      studentId: '',
      currentSemester: '',
      admissionYear: '',
      expectedGraduationYear: '',
      graduationYear: '',
      academicId: '',
      currentCompany: '',
      position: '',
      employmentStatus: '',
      isMentorshipAvailable: false,
    },
  });

  // Prepopulate form cleanly without mock defaults or side-effects in queryFn
  useEffect(() => {
    if (profileResponse?.data) {
      const d = profileResponse.data;
      reset({
        name: d.name || '',
        headline: d.headline || '',
        bio: d.bio || '',
        location: d.location || '',
        phone: d.phone || '',
        phonePublic: Boolean(d.phonePublic),
        linkedinUrl: d.linkedinUrl || '',
        githubUrl: d.githubUrl || '',
        websiteUrl: d.websiteUrl || '',
        department: d.department || '',
        batch: d.batch || '',
        skillsStr: d.skills ? d.skills.join(', ') : '',
        studentId: d.studentId || '',
        currentSemester: d.currentSemester || '',
        admissionYear: d.admissionYear || '',
        expectedGraduationYear: d.expectedGraduationYear || '',
        graduationYear: d.graduationYear || '',
        academicId: d.academicId || '',
        currentCompany: d.currentCompany || '',
        position: d.position || '',
        employmentStatus: d.employmentStatus || '',
        isMentorshipAvailable: Boolean(d.isMentorshipAvailable),
      });

      if (d.avatarUrl) {
        setAvatarUrl(d.avatarUrl);
      }
    }
  }, [profileResponse, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<UserProfile>) => updateMe(accessToken, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      queryClient.invalidateQueries({ queryKey: ['directory'] });

      if (res.data) {
        updateUser({
          name: res.data.name,
          department: res.data.department,
          batch: res.data.batch,
          avatarUrl: res.data.avatarUrl,
        });
      }

      setNotice('Your profile has been saved successfully.');
      setTimeout(() => {
        router.push(`${basePath}/profile`);
      }, 1200);
    },
    onError: (err: unknown) => {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile.');
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    setNotice(null);
    setErrorMsg(null);

    const skills = values.skillsStr
      ? values.skillsStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const payload: Record<string, unknown> = {
      name: values.name.trim(),
      headline: values.headline?.trim() || null,
      bio: values.bio?.trim() || null,
      location: values.location?.trim() || null,
      phone: values.phone?.trim() || null,
      phonePublic: values.phonePublic,
      linkedinUrl: values.linkedinUrl?.trim() || null,
      githubUrl: values.githubUrl?.trim() || null,
      websiteUrl: values.websiteUrl?.trim() || null,
      department: values.department?.trim() || null,
      batch: values.batch?.trim() || null,
      skills,
    };

    if (currentRole === 'STUDENT') {
      payload.studentId = values.studentId?.trim() || null;
      payload.currentSemester = values.currentSemester?.trim() || null;
      payload.admissionYear = values.admissionYear?.trim() || null;
      payload.expectedGraduationYear = values.expectedGraduationYear?.trim() || null;
    }

    if (currentRole === 'ALUMNI') {
      payload.graduationYear = values.graduationYear?.trim() || null;
      payload.academicId = values.academicId?.trim() || null;
      payload.currentCompany = values.currentCompany?.trim() || null;
      payload.position = values.position?.trim() || null;
      payload.employmentStatus = values.employmentStatus?.trim() || null;
      payload.isMentorshipAvailable = values.isMentorshipAvailable;
    }

    updateMutation.mutate(payload as unknown as Partial<UserProfile>);
  };

  const isStaff = currentRole === 'SUPER_ADMIN' || currentRole === 'MODERATOR';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`${basePath}/profile`}>
            <ArrowLeft size={14} /> Back to Profile
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow="CREDENTIALS & RECORD"
        title="Edit Profile"
        description="Update your professional credentials, institutional record, and contact visibility."
      />

      {notice && (
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-800 flex items-start gap-2.5 shadow-2xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed flex-1">{notice}</div>
        </div>
      )}
      {errorMsg && <FormAlert>{errorMsg}</FormAlert>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {/* Section 1: Cloudinary Profile Photo */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 m-0">Profile Avatar Photo</h3>
          <p className="text-xs text-slate-500 m-0">
            Upload your professional portrait. Images are automatically cropped and optimized via Cloudinary CDN.
          </p>

          <div className="pt-2">
            <MediaUploader
              purpose="PROFILE_PHOTO"
              accept="image"
              aspectRatio="1:1"
              currentUrl={avatarUrl}
              currentPublicId={avatarPublicId}
              onUploadComplete={(asset) => {
                setAvatarUrl(asset.url);
                setAvatarPublicId(asset.publicId);
                updateUser({ avatarUrl: asset.url });
                queryClient.invalidateQueries({ queryKey: ['my-profile'] });
                setNotice('Avatar photo updated successfully.');
                setTimeout(() => setNotice(null), 3000);
              }}
              onRemove={() => {
                setAvatarUrl(null);
                setAvatarPublicId(null);
                updateUser({ avatarUrl: null });
                queryClient.invalidateQueries({ queryKey: ['my-profile'] });
              }}
            />
          </div>
        </div>

        {/* Section 2: Form Details */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 m-0">Basic Identity</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <Input {...register('name')} placeholder="Your legal full name" />
                {errors.name && <p className="text-xs text-rose-500 m-0">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Professional Headline</label>
                <Input
                  {...register('headline')}
                  placeholder={
                    isStaff
                      ? 'e.g. Lead System Administrator'
                      : currentRole === 'ALUMNI'
                      ? 'e.g. Senior Software Architect at Google'
                      : 'e.g. Aspiring Systems Engineer'
                  }
                />
                {errors.headline && (
                  <p className="text-xs text-rose-500 m-0">{errors.headline.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Personal Biography</label>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder="Share your background, achievements, and focus areas..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
              {errors.bio && <p className="text-xs text-rose-500 m-0">{errors.bio.message}</p>}
            </div>
          </div>

          {/* Section 3: Role-Specific Academic or Career Information */}
          {currentRole === 'STUDENT' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 m-0">Academic Record (Student)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Department</label>
                  <Input {...register('department')} placeholder="e.g. Computer Science & Engineering" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Batch Year</label>
                  <Input {...register('batch')} placeholder="e.g. 2023" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">University Student ID</label>
                  <Input {...register('studentId')} placeholder="e.g. 2023100104" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Current Semester</label>
                  <Input {...register('currentSemester')} placeholder="e.g. 6th Semester" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Admission Year</label>
                  <Input {...register('admissionYear')} placeholder="e.g. 2022" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Expected Graduation</label>
                  <Input {...register('expectedGraduationYear')} placeholder="e.g. 2026" />
                </div>
              </div>
            </div>
          )}

          {currentRole === 'ALUMNI' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 m-0">Professional & Alumni Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Current Company / Organization</label>
                  <Input {...register('currentCompany')} placeholder="e.g. Microsoft Corporation" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Position / Job Title</label>
                  <Input {...register('position')} placeholder="e.g. Lead Platform Architect" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Department</label>
                  <Input {...register('department')} placeholder="e.g. Computer Science" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Graduation Year</label>
                  <Input {...register('graduationYear')} placeholder="e.g. 2020" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Academic / Roll ID</label>
                  <Input {...register('academicId')} placeholder="e.g. 20161002" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Employment Status</label>
                  <Input {...register('employmentStatus')} placeholder="e.g. Employed Full-time" />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('isMentorshipAvailable')}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Open for Mentorship (allow current students to request career guidance)
                  </span>
                </label>
              </div>
            </div>
          )}

          {isStaff && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 m-0">Institutional Department / Office</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Office / Unit Name</label>
                  <Input {...register('department')} placeholder="e.g. Central Administration / ICT Cell" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Location / Campus Desk</label>
                  <Input {...register('location')} placeholder="e.g. Administrative Building, Room 402" />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Skills (Student & Alumni) */}
          {!isStaff && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 m-0">Skills & Competencies</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Technical & Professional Skills (comma-separated)
                </label>
                <Input
                  {...register('skillsStr')}
                  placeholder="e.g. React, TypeScript, Python, Cloud Architecture, Leadership"
                />
                <p className="text-[11px] text-slate-400 m-0">
                  Separate each skill with a comma. These will appear as badges on your profile.
                </p>
              </div>
            </div>
          )}

          {/* Section 5: Contact & Social Links */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 m-0">Contact & External Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <Input {...register('phone')} placeholder="e.g. +8801700000000" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">LinkedIn Profile URL</label>
                <Input {...register('linkedinUrl')} placeholder="https://linkedin.com/in/username" />
                {errors.linkedinUrl && (
                  <p className="text-xs text-rose-500 m-0">{errors.linkedinUrl.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">GitHub Profile URL</label>
                <Input {...register('githubUrl')} placeholder="https://github.com/username" />
                {errors.githubUrl && (
                  <p className="text-xs text-rose-500 m-0">{errors.githubUrl.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Portfolio / Website URL</label>
                <Input {...register('websiteUrl')} placeholder="https://yourwebsite.com" />
                {errors.websiteUrl && (
                  <p className="text-xs text-rose-500 m-0">{errors.websiteUrl.message}</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('phonePublic')}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Make phone number visible to verified members
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link href={`${basePath}/profile`}>Cancel</Link>
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || updateMutation.isPending}>
              <Save size={14} />
              {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
