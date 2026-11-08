'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';

interface AuditEntry {
  id: string;
  action: 'USER_VERIFIED' | 'USER_REJECTED' | 'JOB_APPROVED' | 'JOB_REJECTED' | 'ADMIN_INVITED' | 'ROLE_UPDATED';
  actorName: string;
  actorRole: string;
  target: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

const INITIAL_LOGS: AuditEntry[] = [
  {
    id: 'log-001',
    action: 'USER_VERIFIED',
    actorName: 'Dr. Anisur Rahman',
    actorRole: 'University Admin',
    target: 'Sabbir Ahmed (Student #160101)',
    details: 'Verified academic enrollment against university registrar registry for CSE Department.',
    ipAddress: '103.114.98.12',
    timestamp: '2026-11-08 17:42:10 UTC',
  },
  {
    id: 'log-002',
    action: 'JOB_APPROVED',
    actorName: 'Monirul Islam',
    actorRole: 'Moderator',
    target: 'Junior Frontend Engineer at Vertex Labs',
    details: 'Content validated; legit company email and career URL confirmed.',
    ipAddress: '103.114.98.45',
    timestamp: '2026-11-08 16:15:32 UTC',
  },
  {
    id: 'log-003',
    action: 'USER_VERIFIED',
    actorName: 'Dr. Anisur Rahman',
    actorRole: 'University Admin',
    target: 'Tahmina Rahman (Alumni 2019)',
    details: 'Accredited graduation transcript and bachelor degree credentials.',
    ipAddress: '103.114.98.12',
    timestamp: '2026-11-08 15:30:00 UTC',
  },
  {
    id: 'log-004',
    action: 'JOB_REJECTED',
    actorName: 'Monirul Islam',
    actorRole: 'Moderator',
    target: 'Crypto Forex Marketing Intern',
    details: 'Rejected violation: unsolicited commission referral scheme with unverified recruiter contact.',
    ipAddress: '103.114.98.45',
    timestamp: '2026-11-08 14:02:19 UTC',
  },
  {
    id: 'log-005',
    action: 'ADMIN_INVITED',
    actorName: 'Platform Super Admin',
    actorRole: 'Super Admin',
    target: 'registrar.office@nwu.ac.bd',
    details: 'Provisioned institutional admin invite token with 72h expiration limit.',
    ipAddress: '180.234.12.89',
    timestamp: '2026-11-08 11:20:05 UTC',
  },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>(INITIAL_LOGS);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const filteredLogs = logs.filter((entry) => {
    const matchAction = filterAction === 'ALL' || entry.action === filterAction;
    const matchSearch =
      !searchTerm ||
      entry.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchAction && matchSearch;
  });

  const handleExportCSV = () => {
    setExportNotice('Audit log records exported to compliance CSV archive.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <section className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/dashboard/admin" className="back-link" style={{ marginBottom: '0.75rem' }}>
            <ArrowLeft size={16} /> Back to University Admin Desk
          </Link>
          <p className="eyebrow eyebrow--red">INSTITUTIONAL GOVERNANCE & COMPLIANCE</p>
          <h1>System Security Audit Log</h1>
          <p className="lede">
            Immutable chronicle of all administrative verifications, content moderation decisions, role privilege changes, and access grants.
          </p>
        </div>

        <Button onClick={handleExportCSV}>
          <Download size={16} /> Export Compliance Log (CSV)
        </Button>
      </div>

      {exportNotice && (
        <div
          style={{
            margin: '1.5rem 0',
            padding: '0.85rem 1.25rem',
            border: '2px solid var(--ink)',
            background: '#f0fdf4',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} /> {exportNotice}
        </div>
      )}

      {/* Stats Strip */}
      <div
        style={{
          margin: '2rem 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ border: '2px solid var(--ink)', padding: '1rem', background: 'var(--paper)' }}>
          <p className="eyebrow">TOTAL RECORDED EVENTS</p>
          <p style={{ fontFamily: 'var(--display)', fontSize: '2rem', margin: 0 }}>{logs.length}</p>
        </div>
        <div style={{ border: '2px solid var(--ink)', padding: '1rem', background: 'var(--paper)' }}>
          <p className="eyebrow">ADMINISTRATIVE ACTORS</p>
          <p style={{ fontFamily: 'var(--display)', fontSize: '2rem', margin: 0 }}>3</p>
        </div>
        <div style={{ border: '2px solid var(--ink)', padding: '1rem', background: 'var(--paper)' }}>
          <p className="eyebrow">INTEGRITY POLICY</p>
          <p style={{ fontFamily: 'var(--display)', fontSize: '1.25rem', margin: 0, color: '#16a34a' }}>
            Append-Only
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input
            placeholder="Search by actor, target user, or keyword…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {['ALL', 'USER_VERIFIED', 'JOB_APPROVED', 'JOB_REJECTED', 'ADMIN_INVITED'].map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              style={{
                border: '2px solid var(--ink)',
                background: filterAction === act ? 'var(--ink)' : 'var(--paper)',
                color: filterAction === act ? 'var(--paper)' : 'var(--ink)',
                padding: '0.45rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {act.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div style={{ border: '2px solid var(--ink)', background: 'var(--paper)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--ink)', background: 'var(--surface)' }}>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>ACTION TYPE</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>ACTOR</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>TARGET RECORD</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>RATIONALE & DETAILS</th>
              <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                  <Badge
                    variant={
                      entry.action.includes('VERIFIED') || entry.action.includes('APPROVED')
                        ? 'success'
                        : entry.action.includes('REJECTED')
                        ? 'error'
                        : 'neutral'
                    }
                  >
                    {entry.action.replace('_', ' ')}
                  </Badge>
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <strong>{entry.actorName}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{entry.actorRole}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--quiet)' }}>IP: {entry.ipAddress}</div>
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top', fontWeight: 600 }}>
                  {entry.target}
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top', color: 'var(--muted)', maxWidth: '380px' }}>
                  {entry.details}
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--quiet)' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {entry.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
