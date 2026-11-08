'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Send,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { demoJobs } from '@/features/shared/demo-data';
import { useAuthStore } from '@/store/auth-store';

interface PostedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  postedAt: string;
}

export default function MyJobsPage() {
  const user = useAuthStore((state) => state.user);
  const isAlumni = user?.role === 'ALUMNI' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'browse' | 'my-postings' | 'applications'>('browse');
  const [showPostModal, setShowPostModal] = useState(false);
  const [postNotice, setPostNotice] = useState<string | null>(null);

  // Form states
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('Dhaka / Hybrid');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [applyUrl, setApplyUrl] = useState('');
  const [description, setDescription] = useState('');

  const [myJobs, setMyJobs] = useState<PostedJob[]>([
    {
      id: 'job-post-1',
      title: 'Junior Frontend Developer (React/Next.js)',
      company: 'Apex Cloud Solutions',
      location: 'Dhaka · Full-time',
      type: 'Full-time',
      status: 'APPROVED',
      postedAt: 'Oct 25, 2026',
    },
    {
      id: 'job-post-2',
      title: 'Cloud Infrastructure Associate',
      company: 'Brain Station 23',
      location: 'Remote · Full-time',
      type: 'Full-time',
      status: 'PENDING',
      postedAt: 'Just now',
    },
  ]);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !companyName) return;

    const newJob: PostedJob = {
      id: `job-${Date.now()}`,
      title: jobTitle,
      company: companyName,
      location,
      type: employmentType,
      status: 'PENDING',
      postedAt: 'Just now',
    };

    setMyJobs((prev) => [newJob, ...prev]);
    setShowPostModal(false);
    setPostNotice(`"${jobTitle}" has been submitted for moderation! It will become visible once approved.`);
    setJobTitle('');
    setCompanyName('');
    setDescription('');
    setApplyUrl('');
    setTimeout(() => setPostNotice(null), 5000);
  };

  return (
    <section className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="eyebrow">CAREER DESK</p>
          <h1>Opportunities & Employment Board</h1>
          <p className="lede">
            Discover verified jobs from your university alumni network, or post opportunities to mentor junior graduates.
          </p>
        </div>

        {isAlumni && (
          <Button onClick={() => setShowPostModal(true)}>
            <Plus size={16} /> Post an Opportunity
          </Button>
        )}
      </div>

      {postNotice && (
        <div
          style={{
            margin: '1.5rem 0',
            padding: '1rem 1.25rem',
            border: '2px solid var(--ink)',
            background: '#eff6ff',
            color: '#1e40af',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 600,
          }}
        >
          <Clock size={20} /> {postNotice}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '2px solid var(--ink)',
          marginTop: '2rem',
          marginBottom: '2rem',
          paddingBottom: '0.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'browse' ? '4px solid var(--red)' : '4px solid transparent',
            padding: '0.5rem 0.75rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'browse' ? 'var(--ink)' : 'var(--muted)',
          }}
        >
          All Openings ({demoJobs.length})
        </button>

        {isAlumni && (
          <button
            onClick={() => setActiveTab('my-postings')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'my-postings' ? '4px solid var(--red)' : '4px solid transparent',
              padding: '0.5rem 0.75rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              color: activeTab === 'my-postings' ? 'var(--ink)' : 'var(--muted)',
            }}
          >
            My Postings ({myJobs.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('applications')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'applications' ? '4px solid var(--red)' : '4px solid transparent',
            padding: '0.5rem 0.75rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'applications' ? 'var(--ink)' : 'var(--muted)',
          }}
        >
          My Applications (1)
        </button>
      </div>

      {/* Tab 1: Browse Openings */}
      {activeTab === 'browse' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {demoJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: '2px solid var(--ink)',
                  padding: '1.5rem',
                  background: 'var(--paper)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Badge variant="neutral">{job.employmentType ?? 'Full-time'}</Badge>
                    <Badge variant="success">Verified Alumni Post</Badge>
                  </div>
                  <h3 style={{ margin: '0.25rem 0', fontSize: '1.4rem' }}>{job.title}</h3>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--ink)' }}>{job.company}</p>
                  <p style={{ margin: '0.25rem 0 0.85rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                    <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    {job.location}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)', maxWidth: '700px' }}>
                    {job.description}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Button asChild size="md">
                    <Link href={`/jobs/${job.id}`}>
                      View & Apply <ArrowUpRight size={16} />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: My Postings (Alumni) */}
      {activeTab === 'my-postings' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {myJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: '2px solid var(--ink)',
                  padding: '1.25rem',
                  background: 'var(--paper)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Badge variant={job.status === 'APPROVED' ? 'success' : job.status === 'PENDING' ? 'warning' : 'error'}>
                      {job.status === 'APPROVED' ? 'Approved & Public' : job.status === 'PENDING' ? 'Under Review' : 'Changes Requested'}
                    </Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--quiet)' }}>Submitted {job.postedAt}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{job.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {job.company} · {job.location}
                  </p>
                </div>
                <div>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/jobs">Preview on Board</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: My Applications */}
      {activeTab === 'applications' && (
        <div style={{ border: '2px solid var(--ink)', padding: '1.5rem', background: 'var(--paper)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Badge variant="warning">Application Under Review</Badge>
                <span style={{ fontSize: '0.8rem', color: 'var(--quiet)' }}>Submitted on Nov 2, 2026</span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Software Engineer, Platform</h3>
              <p style={{ margin: '0.25rem 0', fontWeight: 600 }}>bKash Limited · Dhaka (Hybrid)</p>
              <div style={{ background: 'var(--surface)', padding: '0.75rem', marginTop: '0.75rem', fontSize: '0.85rem', borderLeft: '3px solid var(--ink)' }}>
                <strong>Your pitch note:</strong> "I am a 2025 graduate with practical experience building scalable backend microservices and REST APIs."
              </div>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/jobs">View Role</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Post New Job */}
      {showPostModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 100,
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--paper)',
              border: '3px solid var(--ink)',
              padding: '2rem',
              width: 'min(640px, 100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <p className="eyebrow">CAREER ADVANCEMENT</p>
                <h2 style={{ margin: 0 }}>Post a Career Opportunity</h2>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid #ca8a04',
                background: '#fefce8',
                color: '#854d0e',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ShieldAlert size={18} />
              <span>
                To uphold community trust, all alumni postings undergo institutional moderator review before being made public.
              </span>
            </div>

            <form onSubmit={handleCreateJob}>
              <Input
                label="Job Title / Role"
                placeholder="e.g. Associate Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />

              <Input
                label="Company / Organization"
                placeholder="e.g. Brain Station 23 / ShopUp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Work Mode"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dhaka (Hybrid) / Remote"
                  required
                />
                <Input
                  label="Employment Type"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  placeholder="Full-time / Internship"
                  required
                />
              </div>

              <Input
                label="Application Link or Referral Email"
                placeholder="https://company.com/careers or referral@domain.com"
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
              />

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  Role Description & Candidate Requirements
                </label>
                <textarea
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--ink)',
                    background: 'var(--paper)',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                  }}
                  placeholder="Describe responsibilities, required technical skills, and instructions for university students."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button type="submit" style={{ flex: 1 }}>
                  Submit for Moderation
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowPostModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
