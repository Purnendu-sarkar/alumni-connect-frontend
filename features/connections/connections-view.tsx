'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Handshake,
  Mail,
  MessageSquare,
  Plus,
  Send,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { PageHeader } from '@/components/dashboard/page-header';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types/domain';

interface ConnectionItem {
  id: string;
  name: string;
  position: string;
  company: string;
  department: string;
  batch: string;
  email: string;
  connectedSince: string;
  avatarUrl?: string | null;
}

interface RequestItem {
  id: string;
  name: string;
  role: string;
  company: string;
  department: string;
  batch: string;
  message: string;
  date: string;
  avatarUrl?: string | null;
}

const INITIAL_ACTIVE: ConnectionItem[] = [
  {
    id: 'conn-1',
    name: 'Tanvir Hossain',
    position: 'Engineering Manager',
    company: 'Brain Station 23',
    department: 'Computer Science & Engineering',
    batch: '2014',
    email: 'tanvir.hossain@example.com',
    connectedSince: 'Connected Sep 2026',
  },
  {
    id: 'conn-2',
    name: 'Sadia Rahman',
    position: 'Product Lead',
    company: 'Pathao',
    department: 'Computer Science & Engineering',
    batch: '2016',
    email: 'sadia.rahman@example.com',
    connectedSince: 'Connected Oct 2026',
  },
  {
    id: 'conn-3',
    name: 'Arif Uddin',
    position: 'Solutions Architect',
    company: 'Grameenphone',
    department: 'Electrical & Electronic Engineering',
    batch: '2015',
    email: 'arif.uddin@example.com',
    connectedSince: 'Connected Nov 2026',
  },
];

const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: 'req-1',
    name: 'Nafisa Chowdhury',
    role: 'UX Researcher',
    company: 'ShopUp',
    department: 'Computer Science & Engineering',
    batch: 'Batch 2019',
    message: 'Hello! I noticed your profile in the campus network and would love to exchange insights on product design and research.',
    date: '2 hours ago',
  },
  {
    id: 'req-2',
    name: 'Samira Khanam',
    role: 'Frontend Engineer',
    company: 'Optimizely',
    department: 'Computer Science & Engineering',
    batch: 'Batch 2020',
    message: 'Hi senior! Seeking feedback on web performance and career pathways into frontend architecture.',
    date: 'Yesterday',
  },
];

interface ConnectionsViewProps {
  currentRole: UserRole;
  basePath: string;
  initialTab?: 'active' | 'pending' | 'sent';
}

export function ConnectionsView({ currentRole, basePath, initialTab = 'active' }: ConnectionsViewProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'sent'>(initialTab);
  const [activeConnections, setActiveConnections] = useState<ConnectionItem[]>(INITIAL_ACTIVE);
  const [pendingRequests, setPendingRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [search, setSearch] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Real backend query for connections
  const connectionsQuery = useQuery({
    queryKey: ['connections', accessToken],
    queryFn: async () => {
      try {
        const res = await apiClient<any[]>('/connections', { accessToken });
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: Boolean(accessToken),
  });

  const handleAccept = (req: RequestItem) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
    setActiveConnections((prev) => [
      ...prev,
      {
        id: `conn-${Date.now()}`,
        name: req.name,
        position: req.role,
        company: req.company,
        department: req.department,
        batch: req.batch,
        email: `${req.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        connectedSince: 'Connected just now',
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

  const filteredConnections = activeConnections.filter((c) => {
    const term = search.toLowerCase();
    return (
      !term ||
      c.name.toLowerCase().includes(term) ||
      c.company.toLowerCase().includes(term) ||
      c.department.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ACADEMIC & PROFESSIONAL NETWORK"
        title="Network Connections"
        description="Build relationships across graduating cohorts, seek career guidance, and collaborate on shared initiatives."
        actions={
          <Button asChild size="sm">
            <Link href={`${basePath}/directory`}>
              <Plus size={14} /> Find New Connections
            </Link>
          </Button>
        }
      />

      {actionNotice ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 pb-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === 'active'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck size={16} /> Active Connections ({activeConnections.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 pb-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={16} /> Pending Requests ({pendingRequests.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 pb-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === 'sent'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send size={16} /> Sent Requests (0)
        </button>
      </div>

      {/* Tab Content 1: Active Connections */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search active connections by name, company, or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {filteredConnections.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No active connections match your query"
              description="Explore the member directory to discover classmates and departmental alumni."
              action={
                <Button size="sm" asChild>
                  <Link href={`${basePath}/directory`}>Explore Directory</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnections.map((person) => (
                <div
                  key={person.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar name={person.name} src={person.avatarUrl} />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 m-0">{person.name}</h4>
                        <p className="text-xs text-slate-500 m-0 mt-0.5">
                          {person.position} · {person.company}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 m-0 mb-4">
                      {person.department} (Batch {person.batch}) · {person.connectedSince}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Button size="sm" variant="secondary" className="flex-1" asChild>
                      <a href={`mailto:${person.email}`}>
                        <Mail size={13} /> Email
                      </a>
                    </Button>
                    <Button size="sm" variant="primary" className="flex-1" asChild>
                      <Link href={`${basePath}/messages?user=${person.id}`}>
                        <MessageSquare size={13} /> Chat
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Pending Requests */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No pending requests awaiting review"
              description="You have reviewed all incoming connection invitations."
            />
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar name={req.name} src={req.avatarUrl} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 m-0">{req.name}</h4>
                        <span className="text-[10px] font-semibold text-slate-400">• {req.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">
                        {req.role} at {req.company} ({req.department})
                      </p>
                      <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border-l-2 border-blue-500 text-xs italic text-slate-700">
                        &quot;{req.message}&quot;
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button size="sm" variant="primary" onClick={() => handleAccept(req)}>
                      <Check size={14} /> Accept Request
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDecline(req.id, req.name)}>
                      <X size={14} /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Sent Requests */}
      {activeTab === 'sent' && (
        <EmptyState
          icon={Send}
          title="No outstanding sent requests"
          description="You do not have any pending connection requests sent to other members."
          action={
            <Button size="sm" asChild>
              <Link href={`${basePath}/directory`}>Find Members to Connect</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
