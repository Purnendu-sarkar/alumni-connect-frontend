'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAuditLogs, type AuditLogItem } from '@/lib/api/admin.api';
import { useAuthStore } from '@/store/auth-store';

export default function AdminAuditLogsPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-audit-logs', accessToken],
    queryFn: () => getAuditLogs(accessToken, 1, 100),
    enabled: Boolean(accessToken),
  });

  const auditData = data?.data;
  const logs: AuditLogItem[] = auditData?.logs || [];

  const filteredLogs = logs.filter((entry) => {
    const matchAction = filterAction === 'ALL' || entry.action.toUpperCase().includes(filterAction);
    const matchSearch =
      !searchTerm ||
      entry.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchAction && matchSearch;
  });

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Action', 'Actor Name', 'Actor Role', 'Target', 'Details', 'Timestamp'];
    const rows = filteredLogs.map((l) => [
      `"${l.action}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.target.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.timestamp}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Audit log records exported to compliance CSV archive.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <section className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/dashboard/super-admin" className="back-link" style={{ marginBottom: '0.75rem' }}>
            <ArrowLeft size={16} /> Back to Super Admin Desk
          </Link>
          <p className="eyebrow eyebrow--red">INSTITUTIONAL GOVERNANCE & COMPLIANCE</p>
          <h1>System Security Audit Log</h1>
          <p className="lede">
            Immutable chronicle of all administrative verifications, content moderation decisions, role privilege changes, and access grants.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => refetch()}>
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button onClick={handleExportCSV} disabled={filteredLogs.length === 0}>
            <Download size={16} /> Export Compliance Log (CSV)
          </Button>
        </div>
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
          <p style={{ fontFamily: 'var(--display)', fontSize: '2rem', margin: 0 }}>
            {auditData?.meta?.total ?? logs.length}
          </p>
        </div>
        <div style={{ border: '2px solid var(--ink)', padding: '1rem', background: 'var(--paper)' }}>
          <p className="eyebrow">CURRENT PAGE</p>
          <p style={{ fontFamily: 'var(--display)', fontSize: '2rem', margin: 0 }}>
            {auditData?.meta?.page ?? 1} / {auditData?.meta?.totalPages || 1}
          </p>
        </div>
        <div style={{ border: '2px solid var(--ink)', padding: '1rem', background: 'var(--paper)' }}>
          <p className="eyebrow">INTEGRITY POLICY</p>
          <p style={{ fontFamily: 'var(--display)', fontSize: '1.25rem', margin: 0, color: '#16a34a' }}>
            Append-Only Audit Trail
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
          {['ALL', 'VERIF', 'JOB', 'MODERATOR', 'AUTH'].map((act) => (
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
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div style={{ border: '2px solid var(--ink)', background: 'var(--paper)', overflowX: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
            Loading system audit logs…
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
            No matching audit log records found.
          </div>
        ) : (
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
                          : entry.action.includes('REJECTED') || entry.action.includes('REVOKED')
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
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'top', fontWeight: 600 }}>
                    {entry.target}
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'top', color: 'var(--muted)', maxWidth: '380px' }}>
                    {entry.details}
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'top', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--quiet)' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
