'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Edit3, Save, Upload, X } from 'lucide-react';
import Link from 'next/link';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/dashboard/page-header';
import { getMe, updateMe, uploadAvatar } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserProfile, UserRole } from '@/types/domain';

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

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [batch, setBatch] = useState(user?.batch || '2022');
  const [position, setPosition] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [bio, setBio] = useState('');
  const [skillsStr, setSkillsStr] = useState('React, Next.js, TypeScript, PostgreSQL');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [phonePublic, setPhonePublic] = useState(false);

  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Prepopulate with real server profile
  useQuery({
    queryKey: ['my-profile', accessToken],
    queryFn: async () => {
      const res = await getMe(accessToken);
      if (res.data) {
        const d = res.data;
        if (d.name) setName(d.name);
        if (d.department) setDepartment(d.department);
        if (d.batch) setBatch(d.batch);
        if (d.position) setPosition(d.position);
        if (d.currentCompany) setCurrentCompany(d.currentCompany);
        if (d.location) setLocation(d.location);
        if (d.bio) setBio(d.bio);
        if (d.skills && d.skills.length > 0) setSkillsStr(d.skills.join(', '));
        if (d.linkedinUrl) setLinkedinUrl(d.linkedinUrl);
        if (d.githubUrl) setGithubUrl(d.githubUrl);
        if (d.phone) setPhone(d.phone);
        if (typeof d.phonePublic === 'boolean') setPhonePublic(d.phonePublic);
      }
      return res.data;
    },
    enabled: Boolean(accessToken),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => updateMe(accessToken, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      if (res.data) {
        updateUser({
          name: res.data.name,
          department: res.data.department,
          batch: res.data.batch,
        });
      }
      setNotice('Your profile has been saved successfully.');
      setTimeout(() => setNotice(null), 4000);
    },
    onError: (err: unknown) => {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile.');
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadAvatar(accessToken, file);
      if (res.data?.avatarUrl) {
        updateUser({ avatarUrl: res.data.avatarUrl });
        setNotice('Avatar photo updated!');
        setTimeout(() => setNotice(null), 3000);
      }
    } catch {
      setErrorMsg('Could not upload image. Ensure it is PNG/JPG under 2MB.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setErrorMsg(null);

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateMutation.mutate({
      name: name.trim(),
      department: department.trim(),
      batch: batch.trim(),
      position: position.trim() || null,
      currentCompany: currentCompany.trim() || null,
      location: location.trim() || null,
      bio: bio.trim() || null,
      skills,
      linkedinUrl: linkedinUrl.trim() || null,
      githubUrl: githubUrl.trim() || null,
      phone: phone.trim() || null,
      phonePublic,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        backHref={`${basePath}/profile`}
        backLabel="Back to Profile"
        eyebrow="ACCOUNT MANAGEMENT"
        title="Edit Profile Information"
        description="Update your academic credentials, employment position, technical skills, and public bio."
      />

      {notice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      {errorMsg ? <FormAlert>{errorMsg}</FormAlert> : null}

      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <Avatar name={name || 'User'} src={user?.avatarUrl} className="h-16 w-16 text-lg" />
          <div>
            <p className="text-xs font-bold text-slate-800 m-0">Profile Avatar</p>
            <p className="text-[11px] text-slate-500 m-0 mt-0.5">JPEG, PNG, or WebP up to 2MB.</p>
            <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md cursor-pointer transition-colors">
              <Upload size={13} /> Change Photo
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Department *"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Batch Year *"
              placeholder="e.g. 2022"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              required
            />

            <Input
              label="Workplace Location"
              placeholder="e.g. Dhaka, Bangladesh"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Current Position / Title"
              placeholder="e.g. Software Engineer / Student Researcher"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />

            <Input
              label="Current Company / Organization"
              placeholder="e.g. Pathao / North Western University"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Technical Skills & Areas of Focus (comma-separated)
            </label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="React, Next.js, Node.js, Go, Python, AWS"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Personal & Professional Bio
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your current academic and career interests, project accomplishments, and what you hope to achieve…"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="LinkedIn Profile URL"
              placeholder="https://linkedin.com/in/username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />

            <Input
              label="GitHub Profile URL"
              placeholder="https://github.com/username"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link href={`${basePath}/profile`}>Cancel</Link>
            </Button>
            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
              <Save size={14} /> {updateMutation.isPending ? 'Saving Changes…' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
