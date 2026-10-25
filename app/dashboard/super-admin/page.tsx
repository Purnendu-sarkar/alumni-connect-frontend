'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Clock,
  Layers,
  Plus,
  Power,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import {
  createUniversity,
  getAdminStats,
  getUniversities,
  toggleUniversityStatus,
} from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';

export default function SuperAdminDashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Owner';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const statsQuery = useQuery({
    queryKey: ['admin-stats', accessToken],
    queryFn: () => getAdminStats(accessToken),
    enabled: Boolean(accessToken),
  });

  const universitiesQuery = useQuery({
    queryKey: ['super-admin-universities', accessToken],
    queryFn: () => getUniversities(accessToken),
    enabled: Boolean(accessToken),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; domain: string }) =>
      createUniversity(accessToken, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-universities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowCreateModal(false);
      setName('');
      setSlug('');
      setDomain('');
      setActionSuccess('New university tenant provisioned successfully.');
      setActionError(null);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to provision university.');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ universityId, isActive }: { universityId: string; isActive: boolean }) =>
      toggleUniversityStatus(accessToken, universityId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-universities'] });
      setActionSuccess('University status updated successfully.');
      setActionError(null);
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Failed to change university status.');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!name.trim() || !slug.trim() || !domain.trim()) {
      setActionError('Name, slug, and domain are required.');
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      domain: domain.trim().toLowerCase(),
    });
  };

  const stats = statsQuery.data?.data;
  const universities = universitiesQuery.data?.data ?? [];

  return (
    <section className="dashboard-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p className="eyebrow">PLATFORM GOVERNANCE & MULTI-TENANCY</p>
          <h1>Super Admin Console — {firstName}.</h1>
          <p className="lede">
            Root System Desk · Manage institutional tenants, platform metrics, and system audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Badge variant="neutral" style={{ backgroundColor: '#ede9fe', color: '#6d28d9', borderColor: '#ddd6fe' }}>
            <Layers size={14} style={{ marginRight: '4px' }} /> Super Admin
          </Badge>
          <Button
            variant="secondary"
            onClick={() => {
              statsQuery.refetch();
              universitiesQuery.refetch();
            }}
            disabled={universitiesQuery.isFetching}
          >
            <RefreshCw size={14} className={universitiesQuery.isFetching ? 'animate-spin' : ''} /> Refresh Console
          </Button>
        </div>
      </div>

      {actionSuccess ? (
        <div style={{ marginTop: '1.25rem' }}>
          <Badge variant="success">{actionSuccess}</Badge>
        </div>
      ) : null}

      {actionError ? (
        <div style={{ marginTop: '1.25rem' }}>
          <FormAlert>{actionError}</FormAlert>
        </div>
      ) : null}

      {/* Platform Wide Stats */}
      <div className="dashboard-stats" style={{ marginTop: '1.5rem' }}>
        <article>
          <Building2 size={24} style={{ color: '#7c3aed' }} />
          <strong>{stats?.totalUniversities ?? universities.length}</strong>
          <span>INSTITUTIONAL TENANTS</span>
        </article>
        <article>
          <Users size={24} style={{ color: '#2563eb' }} />
          <strong>{stats?.totalUsers ?? '…'}</strong>
          <span>PLATFORM USERS</span>
        </article>
        <article>
          <Clock size={24} style={{ color: '#d97706' }} />
          <strong>{stats?.pendingVerifications ?? '…'}</strong>
          <span>GLOBAL VERIFICATIONS PENDING</span>
        </article>
        <article>
          <BriefcaseBusiness size={24} style={{ color: '#16a34a' }} />
          <strong>{stats?.totalJobs ?? '…'}</strong>
          <span>TOTAL LISTED JOBS</span>
        </article>
      </div>

      {/* Quick Governance Links */}
      <div className="dashboard-split" style={{ marginTop: '2rem' }}>
        <section>
          <div className="section-heading">
            <div>
              <p className="eyebrow">GLOBAL QUEUES</p>
              <h2>Cross-Tenant Oversight</h2>
            </div>
          </div>
          <p style={{ color: 'var(--muted, #666)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Access moderation and verification workflows across all connected universities. Super Admins
            can review institutional staff queues and resolve edge escalations.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Button asChild>
              <Link href="/admin/verification">Global Verification Desk <ArrowUpRight size={14} /></Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard/moderator">Job Moderation Desk <ArrowUpRight size={14} /></Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/alumni">All Platform Members</Link>
            </Button>
          </div>
        </section>

        <aside className="dashboard-note">
          <p className="eyebrow">SECURITY CONFINEMENT</p>
          <h2>Tenant Isolation & Sandboxing</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted, #444)', lineHeight: 1.5 }}>
            • <strong>Permanent Owner:</strong> Safe from demotion and lockout.<br />
            • <strong>Demo Accounts:</strong> Tagged with <code>isDemo: true</code> and restricted to sandbox data only.<br />
            • <strong>Production Safeguard:</strong> Demo credentials, tokens, and endpoints are rejected in production.
          </p>
        </aside>
      </div>

      {/* Provision University Modal */}
      {showCreateModal ? (
        <div
          className="dashboard-note"
          style={{
            marginTop: '2rem',
            padding: '1.75rem',
            borderRadius: '10px',
            border: '2px solid #7c3aed',
            background: 'var(--surface, #fff)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p className="eyebrow" style={{ margin: 0, color: '#7c3aed' }}>NEW TENANT ONBOARDING</p>
              <h2 style={{ margin: '0.25rem 0 0' }}>Provision Institutional Tenant</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem' }}>
            <Input
              label="Institution Full Name *"
              placeholder="e.g. Bangladesh University of Engineering and Technology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <Input
                label="Tenant Slug *"
                placeholder="e.g. buet"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
              <Input
                label="Official Email Domain *"
                placeholder="e.g. buet.ac.bd"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Plus size={16} /> {createMutation.isPending ? 'Provisioning…' : 'Create Institution'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Universities / Tenants Table */}
      <div id="universities" style={{ marginTop: '2.5rem' }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">MULTI-TENANT REGISTRY</p>
            <h2>Connected University Tenants ({universities.length})</h2>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Provision Tenant
          </Button>
        </div>

        {universitiesQuery.isLoading ? (
          <p className="empty-state">Loading registered universities…</p>
        ) : universities.length === 0 ? (
          <p className="empty-state">No universities provisioned yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {universities.map((uni) => (
              <div
                key={uni.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  background: 'var(--surface-muted, #f8f8f8)',
                  border: '1px solid var(--border, #e5e5e5)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{uni.name}</strong>
                    {uni.isDemo ? (
                      <Badge variant="neutral" style={{ color: '#d97706', borderColor: '#fcd34d' }}>
                        Sandbox Demo
                      </Badge>
                    ) : null}
                    <Badge variant={uni.isActive ? 'success' : 'neutral'}>
                      {uni.isActive ? 'Active' : 'Suspended'}
                    </Badge>
                  </div>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--muted, #666)' }}>
                    Slug: <code>{uni.slug}</code> · Domain: <code>{uni.domain}</code> · Registered:{' '}
                    {new Date(uni.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      toggleMutation.mutate({
                        universityId: uni.id,
                        isActive: !uni.isActive,
                      })
                    }
                    disabled={toggleMutation.isPending}
                    style={{
                      color: uni.isActive ? '#dc2626' : '#16a34a',
                      fontSize: '0.85rem',
                    }}
                  >
                    <Power size={14} style={{ marginRight: '4px' }} />
                    {uni.isActive ? 'Suspend' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
