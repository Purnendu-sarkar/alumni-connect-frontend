'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Handshake,
  Mail,
  MessageCircle,
  Plus,
  Send,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { demoAlumni } from '@/features/shared/demo-data';

interface ConnectionRequest {
  id: string;
  name: string;
  role: string;
  company: string;
  department: string;
  batch: string;
  message: string;
  date: string;
  avatarText: string;
}

const INITIAL_PENDING_REQUESTS: ConnectionRequest[] = [
  {
    id: 'req-1',
    name: 'Tanvir Hossain',
    role: 'Junior DevOps Engineer',
    company: 'Brain Station 23',
    department: 'Computer Science & Engineering',
    batch: 'Batch 2021',
    message: 'Hello! I noticed your profile and would love to exchange insights on AWS cloud architectures and microservices.',
    date: '2 hours ago',
    avatarText: 'TH',
  },
  {
    id: 'req-2',
    name: 'Farhana Yeasmin',
    role: 'UI/UX Designer',
    company: 'Pathao',
    department: 'Electrical & Electronic Engineering',
    batch: 'Batch 2022',
    message: 'Hi senior! Seeking feedback on design system standards and transition into product design.',
    date: 'Yesterday',
    avatarText: 'FY',
  },
];

const INITIAL_ACTIVE_CONNECTIONS = [
  {
    id: 'conn-1',
    name: 'Tahmina Rahman',
    role: 'Lead Software Architect',
    company: 'Apex Cloud Solutions',
    department: 'Computer Science & Engineering',
    batch: 'Batch 2019',
    connectedSince: 'Connected Sep 2026',
    email: 'tahmina.rahman@example.com',
    avatarText: 'TR',
  },
  {
    id: 'conn-2',
    name: 'Sabbir Ahmed',
    role: 'Enrolled Student',
    company: 'North Western University',
    department: 'Electrical & Electronic Engineering',
    batch: 'Batch 2025',
    connectedSince: 'Connected Oct 2026',
    email: 'sabbir.ahmed@example.com',
    avatarText: 'SA',
  },
];

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'sent'>('active');
  const [activeConnections, setActiveConnections] = useState(INITIAL_ACTIVE_CONNECTIONS);
  const [pendingRequests, setPendingRequests] = useState(INITIAL_PENDING_REQUESTS);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleAccept = (req: ConnectionRequest) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
    setActiveConnections((prev) => [
      ...prev,
      {
        id: `conn-${Date.now()}`,
        name: req.name,
        role: req.role,
        company: req.company,
        department: req.department,
        batch: req.batch,
        connectedSince: 'Just now',
        email: `${req.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        avatarText: req.avatarText,
      },
    ]);
    setActionNotice(`You are now connected with ${req.name}!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDecline = (reqId: string, name: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
    setActionNotice(`Connection request from ${name} was declined.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <section className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="eyebrow">PROFESSIONAL COMMUNITY</p>
          <h1>Network & Mentorship Connections</h1>
          <p className="lede">
            Build meaningful relationships across graduating classes, seek mentorship, and collaborate on shared initiatives.
          </p>
        </div>
        <Button asChild>
          <Link href="/alumni">
            <Plus size={16} /> Find New Connections
          </Link>
        </Button>
      </div>

      {actionNotice && (
        <div
          style={{
            margin: '1.5rem 0',
            padding: '0.85rem 1.25rem',
            border: '2px solid var(--ink)',
            background: '#f0fdf4',
            color: '#166534',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} /> {actionNotice}
        </div>
      )}

      {/* Connection Navigation Tabs */}
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
          onClick={() => setActiveTab('active')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'active' ? '4px solid var(--red)' : '4px solid transparent',
            padding: '0.5rem 0.75rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'active' ? 'var(--ink)' : 'var(--muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <UserCheck size={16} /> Active Connections ({activeConnections.length})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '4px solid var(--red)' : '4px solid transparent',
            padding: '0.5rem 0.75rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'pending' ? 'var(--ink)' : 'var(--muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Clock size={16} /> Pending Requests ({pendingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sent' ? '4px solid var(--red)' : '4px solid transparent',
            padding: '0.5rem 0.75rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            color: activeTab === 'sent' ? 'var(--ink)' : 'var(--muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Send size={16} /> Sent Requests (0)
        </button>
      </div>

      {/* Tab 1: Active Connections */}
      {activeTab === 'active' && (
        <div>
          {activeConnections.length === 0 ? (
            <p className="empty-state">
              <Users size={24} /> No active connections yet. Explore the alumni directory to connect with seniors.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {activeConnections.map((person) => (
                <div
                  key={person.id}
                  style={{
                    border: '2px solid var(--ink)',
                    padding: '1.25rem',
                    background: 'var(--paper)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                      <div className="avatar">{person.avatarText}</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{person.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {person.role} · {person.company}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--quiet)', margin: '0.25rem 0 1rem' }}>
                      {person.department} ({person.batch}) · {person.connectedSince}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--line)', paddingTop: '0.75rem' }}>
                    <Button asChild size="sm" variant="secondary" style={{ flex: 1 }}>
                      <a href={`mailto:${person.email}`}>
                        <Mail size={14} /> Send Email
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/alumni">View Profile</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pending Requests */}
      {activeTab === 'pending' && (
        <div>
          {pendingRequests.length === 0 ? (
            <p className="empty-state">
              <CheckCircle2 size={24} /> All connection requests have been reviewed!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    border: '2px solid var(--ink)',
                    padding: '1.25rem',
                    background: 'var(--surface)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar">{req.avatarText}</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{req.name}</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {req.role} · {req.company} ({req.department})
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        margin: '0.85rem 0',
                        padding: '0.75rem 1rem',
                        background: '#fff',
                        borderLeft: '3px solid var(--ink)',
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                      }}
                    >
                      "{req.message}"
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--quiet)' }}>Received {req.date}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button size="sm" onClick={() => handleAccept(req)}>
                      <Check size={14} /> Accept Request
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleDecline(req.id, req.name)}>
                      <X size={14} /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Sent Requests */}
      {activeTab === 'sent' && (
        <div>
          <p className="empty-state">
            <Send size={24} /> You have no outstanding sent connection requests.
          </p>
        </div>
      )}

      {/* Suggested People Section */}
      <div style={{ marginTop: '4rem' }}>
        <SectionHeading eyebrow="EXPAND YOUR NETWORK" title="Alumni mentors open to guidance." />
        <div className="alumni-grid">
          {demoAlumni.slice(0, 3).map((alumnus) => (
            <article className="alumni-card" key={alumnus.id}>
              <div className="alumni-card__top">
                <div>
                  <h3 style={{ margin: 0 }}>{alumnus.name}</h3>
                  <p className="alumni-card__role">{alumnus.position}</p>
                  <p className="alumni-card__company">{alumnus.currentCompany}</p>
                </div>
                <div className="avatar">{alumnus.name.slice(0, 2).toUpperCase()}</div>
              </div>
              <p className="alumni-card__bio">{alumnus.bio}</p>
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/alumni/${alumnus.id}`}>
                    Read Profile <ArrowUpRight size={14} />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
