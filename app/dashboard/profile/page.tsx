'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Plus,
  Save,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { getMe, removeAvatar, updateMe, uploadAvatar } from '@/lib/api/user.api';
import { useAuthStore } from '@/store/auth-store';
import type { UserProfile } from '@/types/domain';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Editable form state
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['me', accessToken],
    queryFn: () => getMe(accessToken),
    enabled: Boolean(accessToken),
  });

  const profile = data?.data;

  // Initialize form state once profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name ?? '',
        headline: profile.headline ?? '',
        bio: profile.bio ?? '',
        location: profile.location ?? '',
        department: profile.department ?? '',
        batch: profile.batch ?? '',
        studentId: profile.studentId ?? '',
        currentSemester: profile.currentSemester ?? '',
        admissionYear: profile.admissionYear ?? '',
        expectedGraduationYear: profile.expectedGraduationYear ?? '',
        graduationYear: profile.graduationYear ?? '',
        academicId: profile.academicId ?? '',
        employmentStatus: profile.employmentStatus ?? 'Employed',
        currentCompany: profile.currentCompany ?? '',
        position: profile.position ?? '',
        phone: profile.phone ?? '',
        phonePublic: profile.phonePublic ?? false,
        linkedinUrl: profile.linkedinUrl ?? '',
        websiteUrl: profile.websiteUrl ?? '',
        githubUrl: profile.githubUrl ?? '',
        skills: profile.skills ?? [],
        interests: profile.interests ?? [],
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: (updated: Partial<UserProfile>) => updateMe(accessToken, updated),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData(['me', accessToken], response);
        updateUser({
          name: response.data.name,
          department: response.data.department,
          batch: response.data.batch,
          verified: response.data.verified,
          verificationStatus: response.data.verificationStatus,
          avatarUrl: response.data.avatarUrl,
        });
      }
      setSaveSuccess(true);
      setSaveError(null);
      setActiveTab('view');
      setTimeout(() => setSaveSuccess(false), 4000);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setSaveError(msg);
    },
  });

  const avatarUploadMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(accessToken, file),
    onSuccess: (response) => {
      if (response.data?.avatarUrl) {
        updateUser({ avatarUrl: response.data.avatarUrl });
        refetch();
      }
      setAvatarError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to upload photo.';
      setAvatarError(msg);
    },
  });

  const avatarRemoveMutation = useMutation({
    mutationFn: () => removeAvatar(accessToken),
    onSuccess: () => {
      updateUser({ avatarUrl: null });
      refetch();
      setAvatarError(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to remove photo.';
      setAvatarError(msg);
    },
  });

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Photo must be less than 2MB.');
      return;
    }

    avatarUploadMutation.mutate(file);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const skills = formData.skills ?? [];
    if (!skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...skills, newSkill.trim()] });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: (formData.skills ?? []).filter((s) => s !== skill),
    });
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    const interests = formData.interests ?? [];
    if (!interests.includes(newInterest.trim())) {
      setFormData({ ...formData, interests: [...interests, newInterest.trim()] });
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: (formData.interests ?? []).filter((i) => i !== interest),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <section className="dashboard-page profile-page">
        <p className="eyebrow">YOUR PROFILE</p>
        <p className="empty-state">Loading your profile workspace...</p>
      </section>
    );
  }

  if (isError || !profile) {
    return (
      <section className="dashboard-page profile-page">
        <p className="eyebrow">ERROR</p>
        <div className="dashboard-note" style={{ borderLeft: '4px solid #ef4444' }}>
          <h2>Could not load profile</h2>
          <p>Please make sure you are signed in or retry the request.</p>
          <Button onClick={() => refetch()} variant="secondary" style={{ marginTop: '1rem' }}>
            Retry
          </Button>
        </div>
      </section>
    );
  }

  const isAlumni = profile.role.name === 'ALUMNI';
  const isStudent = profile.role.name === 'STUDENT';

  return (
    <section className="dashboard-page profile-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="eyebrow">MEMBER PROFILE DESK</p>
          <h1 style={{ marginBottom: '0.25rem' }}>{profile.name}</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            {profile.university.name || 'AlumniConnect'} · {profile.role.name}
          </p>
        </div>

        {/* View / Edit Mode Switch */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isAlumni && profile.verified ? (
            <Button asChild variant="ghost">
              <Link href={`/alumni/${profile.id}`}>
                <Eye size={16} /> Public view
              </Link>
            </Button>
          ) : null}
          <Button
            variant={activeTab === 'view' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('view')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'edit' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('edit')}
          >
            Edit profile
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccess ? (
        <div
          className="dashboard-note"
          style={{
            borderLeft: '4px solid #16a34a',
            background: '#f0fdf4',
            color: '#166534',
            marginTop: '1.5rem',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <CheckCircle2 size={18} /> Profile updated successfully.
          </div>
        </div>
      ) : null}

      {/* Verification Status Banner */}
      <div style={{ marginTop: '1.5rem' }}>
        {profile.verificationStatus === 'APPROVED' ? (
          <div
            className="dashboard-note"
            style={{
              borderLeft: '4px solid #16a34a',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <CheckCircle2 size={28} style={{ color: '#16a34a' }} />
            <div>
              <strong style={{ color: '#166534', fontSize: '1.05rem', display: 'block' }}>
                Verified University Member
              </strong>
              <span style={{ fontSize: '0.9rem', color: '#15803d' }}>
                Your academic credentials have been verified by your institution. Your profile is
                fully active in the network directory.
              </span>
            </div>
          </div>
        ) : profile.verificationStatus === 'REJECTED' ? (
          <div
            className="dashboard-note"
            style={{
              borderLeft: '4px solid #ef4444',
              background: '#fef2f2',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b91c1c' }}>
              <XCircle size={26} />
              <strong style={{ fontSize: '1.05rem' }}>Verification Needs Action</strong>
            </div>
            <p style={{ margin: '0.5rem 0', color: '#991b1b', fontSize: '0.95rem' }}>
              <strong>Admin feedback:</strong> {profile.rejectionReason || 'Details could not be confirmed.'}
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#b91c1c' }}>
              Please correct your academic details below (Department, Batch, Student ID) and save to
              automatically resubmit for review.
            </p>
          </div>
        ) : (
          <div
            className="dashboard-note"
            style={{
              borderLeft: '4px solid #f59e0b',
              background: '#fffbeb',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b45309' }}>
              <Clock size={24} />
              <strong style={{ fontSize: '1.05rem' }}>Pending University Verification</strong>
            </div>
            <p style={{ margin: '0.5rem 0 0', color: '#92400e', fontSize: '0.9rem' }}>
              Your profile is currently under review by university administrators. You have complete
              access to your dashboard and connections. Unverified alumni profiles remain unlisted in
              the public directory until approved.
            </p>
          </div>
        )}
      </div>

      {/* Profile Completion Indicator */}
      {typeof profile.completionPercentage === 'number' ? (
        <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'var(--surface-muted, #f8f8f8)', borderRadius: 'var(--radius, 8px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
            <span>Profile Completeness</span>
            <span>{profile.completionPercentage}%</span>
          </div>
          <div style={{ height: '8px', width: '100%', background: '#e5e5e5', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${profile.completionPercentage}%`,
                background: profile.completionPercentage > 80 ? '#16a34a' : 'var(--accent, #111)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Avatar Section */}
      <div
        className="profile-hero"
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          background: 'var(--surface-muted, #f8f8f8)',
          padding: '1.5rem',
          borderRadius: 'var(--radius, 8px)',
        }}
      >
        <Avatar name={profile.name} src={profile.avatarUrl} className="avatar--xl" />

        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: '1.1rem', display: 'block' }}>Profile Avatar</strong>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted, #666)' }}>
            Upload a clear photo (JPEG, PNG, or WebP up to 2MB).
          </span>

          {avatarError ? (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {avatarError}
            </p>
          ) : null}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
            <label className="btn btn--secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Camera size={16} />
              <span>{avatarUploadMutation.isPending ? 'Uploading…' : 'Change photo'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarFile}
                style={{ display: 'none' }}
                disabled={avatarUploadMutation.isPending}
              />
            </label>

            {profile.avatarUrl ? (
              <Button
                variant="ghost"
                onClick={() => avatarRemoveMutation.mutate()}
                disabled={avatarRemoveMutation.isPending}
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={16} /> Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* TAB CONTENT: VIEW OR EDIT */}
      {activeTab === 'view' ? (
        <div style={{ marginTop: '2rem' }}>
          <div className="profile-grid">
            <article>
              <p className="eyebrow">ACADEMIC RECORD</p>
              <h2>{profile.department || 'Department not specified'}</h2>
              <p style={{ margin: '0.25rem 0' }}>
                <GraduationCap size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Batch / Class: <strong>{profile.batch || 'Not set'}</strong>
              </p>
              {isStudent && profile.studentId ? (
                <p style={{ margin: '0.25rem 0' }}>
                  Student ID: <strong>{profile.studentId}</strong>
                </p>
              ) : null}
              {isStudent && profile.currentSemester ? (
                <p style={{ margin: '0.25rem 0' }}>
                  Current Semester: <strong>{profile.currentSemester}</strong>
                </p>
              ) : null}
              {isAlumni && profile.academicId ? (
                <p style={{ margin: '0.25rem 0' }}>
                  Academic ID: <strong>{profile.academicId}</strong>
                </p>
              ) : null}
            </article>

            <article>
              <p className="eyebrow">PROFESSIONAL STATUS</p>
              <h2>{profile.position || (isStudent ? 'Student' : 'Alumnus')}</h2>
              <p style={{ margin: '0.25rem 0' }}>
                <Building2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
                {profile.currentCompany || (isStudent ? profile.university.name : 'Open to opportunities')}
              </p>
              {isAlumni && profile.employmentStatus ? (
                <Badge variant="neutral" style={{ marginTop: '0.5rem' }}>
                  {profile.employmentStatus}
                </Badge>
              ) : null}
              {profile.location ? (
                <p style={{ margin: '0.5rem 0 0', color: 'var(--muted, #666)' }}>
                  Location: {profile.location}
                </p>
              ) : null}
            </article>
          </div>

          {/* Bio */}
          {profile.bio ? (
            <article style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--surface-muted, #f8f8f8)', borderRadius: 'var(--radius, 8px)' }}>
              <p className="eyebrow">ABOUT ME</p>
              <p style={{ lineHeight: 1.6, marginTop: '0.5rem' }}>{profile.bio}</p>
            </article>
          ) : null}

          {/* Skills & Interests */}
          <div className="profile-grid" style={{ marginTop: '1.5rem' }}>
            <article>
              <p className="eyebrow">SKILLS & EXPERTISE</p>
              <div className="tag-list" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill) => (
                    <span key={skill} className="filter-chip" style={{ cursor: 'default' }}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <p style={{ color: 'var(--muted, #666)' }}>No skills listed yet.</p>
                )}
              </div>
            </article>

            <article>
              <p className="eyebrow">AREAS OF INTEREST</p>
              <div className="tag-list" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map((interest) => (
                    <span key={interest} className="filter-chip" style={{ cursor: 'default' }}>
                      {interest}
                    </span>
                  ))
                ) : (
                  <p style={{ color: 'var(--muted, #666)' }}>No interests listed yet.</p>
                )}
              </div>
            </article>
          </div>

          {/* Contact & Links */}
          <article style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--surface-muted, #f8f8f8)', borderRadius: 'var(--radius, 8px)' }}>
            <p className="eyebrow">CONTACT & PROFILES</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted, #666)', display: 'block' }}>Email:</span>
                <strong>{profile.email}</strong>
              </div>
              {profile.phone ? (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted, #666)', display: 'block' }}>
                    Phone {profile.phonePublic ? '(Visible to members)' : '(Private)'}:
                  </span>
                  <strong>{profile.phone}</strong>
                </div>
              ) : null}
              {profile.linkedinUrl ? (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted, #666)', display: 'block' }}>LinkedIn:</span>
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                    View LinkedIn Profile
                  </a>
                </div>
              ) : null}
              {profile.websiteUrl ? (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted, #666)', display: 'block' }}>Portfolio / Website:</span>
                  <a href={profile.websiteUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                    {profile.websiteUrl}
                  </a>
                </div>
              ) : null}
            </div>
          </article>
        </div>
      ) : (
        /* EDIT PROFILE FORM */
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          {saveError ? <FormAlert>{saveError}</FormAlert> : null}

          {/* Basic Information */}
          <div style={{ marginBottom: '2rem' }}>
            <p className="eyebrow">1. BASIC DETAILS</p>
            <div className="auth-card__grid">
              <Input
                label="Full Name"
                value={formData.name ?? ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Headline / Tagline"
                placeholder="e.g. Senior Backend Engineer @ Pathao | Cloud enthusiast"
                value={formData.headline ?? ''}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              />
            </div>

            <label className="field" style={{ marginTop: '1rem', display: 'block' }}>
              <span className="field__label">About Me / Bio</span>
              <textarea
                className="field__input"
                rows={4}
                placeholder="Briefly describe your background, career focus, and what you're interested in..."
                value={formData.bio ?? ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </label>

            <Input
              label="Location / City"
              placeholder="e.g. Dhaka, Bangladesh or Khulna"
              value={formData.location ?? ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Academic Information */}
          <div style={{ marginBottom: '2rem' }}>
            <p className="eyebrow">2. ACADEMIC CREDENTIALS</p>
            <div className="auth-card__grid">
              <Input
                label="Department"
                value={formData.department ?? ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
              <Input
                label="Batch / Passing Year"
                value={formData.batch ?? ''}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                required
              />
            </div>

            {isStudent ? (
              <div className="auth-card__grid" style={{ marginTop: '1rem' }}>
                <Input
                  label="Student ID"
                  placeholder="e.g. 160101"
                  hint="Official university student identifier"
                  value={formData.studentId ?? ''}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />
                <Input
                  label="Current Semester"
                  placeholder="e.g. 7th Semester"
                  value={formData.currentSemester ?? ''}
                  onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                />
              </div>
            ) : null}

            {isAlumni ? (
              <div className="auth-card__grid" style={{ marginTop: '1rem' }}>
                <Input
                  label="Former Student / Registration ID (Optional)"
                  placeholder="e.g. NWU-CSE-14-042"
                  value={formData.academicId ?? ''}
                  onChange={(e) => setFormData({ ...formData, academicId: e.target.value })}
                />
                <Input
                  label="Graduation Year"
                  placeholder="e.g. 2018"
                  value={formData.graduationYear ?? ''}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                />
              </div>
            ) : null}
          </div>

          {/* Professional Information (Alumni) */}
          {isAlumni ? (
            <div style={{ marginBottom: '2rem' }}>
              <p className="eyebrow">3. PROFESSIONAL CAREER</p>

              <label className="field" style={{ marginBottom: '1rem', display: 'block' }}>
                <span className="field__label">Current Employment Status</span>
                <select
                  className="field__input"
                  value={formData.employmentStatus ?? 'Employed'}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                >
                  <option value="Employed">Currently Employed</option>
                  <option value="Seeking opportunities">Seeking Opportunities / Looking for Work</option>
                  <option value="Entrepreneur / Self-Employed">Entrepreneur / Self-Employed</option>
                  <option value="Higher Studies / Research">Higher Studies / Researcher</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <div className="auth-card__grid">
                <Input
                  label="Company / Organization"
                  placeholder="e.g. Google, Brain Station 23, Unilever"
                  value={formData.currentCompany ?? ''}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                />
                <Input
                  label="Job Title / Position"
                  placeholder="e.g. Software Engineer, Product Manager"
                  value={formData.position ?? ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
            </div>
          ) : null}

          {/* Contact & Social Links */}
          <div style={{ marginBottom: '2rem' }}>
            <p className="eyebrow">4. CONTACT & WEB PROFILES</p>
            <div className="auth-card__grid">
              <div>
                <Input
                  label="Phone Number"
                  placeholder="+8801700000000"
                  value={formData.phone ?? ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.phonePublic ?? false}
                    onChange={(e) => setFormData({ ...formData, phonePublic: e.target.checked })}
                  />
                  <span>Allow verified alumni to see my phone number</span>
                </label>
              </div>

              <Input
                label="LinkedIn Profile URL"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedinUrl ?? ''}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              />
            </div>

            <div className="auth-card__grid" style={{ marginTop: '1rem' }}>
              <Input
                label="Portfolio / Personal Website"
                placeholder="https://mywebsite.com"
                value={formData.websiteUrl ?? ''}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              />
              <Input
                label="GitHub / Code Repository URL"
                placeholder="https://github.com/username"
                value={formData.githubUrl ?? ''}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Skills & Tag Management */}
          <div style={{ marginBottom: '2rem' }}>
            <p className="eyebrow">5. SKILLS & INTERESTS</p>

            <div style={{ marginBottom: '1.25rem' }}>
              <span className="field__label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Skills & Tech Stack
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  className="field__input"
                  placeholder="e.g. Next.js, System Design, Python"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  style={{ maxWidth: '320px' }}
                />
                <Button type="button" variant="secondary" onClick={handleAddSkill}>
                  <Plus size={16} /> Add
                </Button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(formData.skills ?? []).map((skill) => (
                  <span
                    key={skill}
                    className="filter-chip filter-chip--selected"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      aria-label={`Remove ${skill}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="field__label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Areas of Interest
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  className="field__input"
                  placeholder="e.g. Mentoring, Startups, Open Source"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  style={{ maxWidth: '320px' }}
                />
                <Button type="button" variant="secondary" onClick={handleAddInterest}>
                  <Plus size={16} /> Add
                </Button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(formData.interests ?? []).map((interest) => (
                  <span
                    key={interest}
                    className="filter-chip"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      aria-label={`Remove ${interest}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Button type="submit" disabled={saveMutation.isPending}>
              <Save size={16} /> {saveMutation.isPending ? 'Saving changes…' : 'Save profile'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setActiveTab('view')}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
