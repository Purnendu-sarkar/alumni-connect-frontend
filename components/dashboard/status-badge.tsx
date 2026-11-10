'use client';

import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type StatusType =
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SUSPENDED'
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'LIVE'
  | 'DRAFT'
  | 'OPEN'
  | 'RESOLVED'
  | 'IN_REVIEW'
  | 'HIGH'
  | 'URGENT'
  | 'NORMAL';

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const norm = status.toUpperCase().replace(/\s+/g, '_');
  const displayLabel = label || status.replace(/_/g, ' ');

  let bg = '#f3f4f6';
  let text = '#374151';
  let border = '#d1d5db';
  let Icon = Clock;

  switch (norm) {
    case 'APPROVED':
    case 'ACCEPTED':
    case 'ACTIVE':
    case 'LIVE':
    case 'RESOLVED':
    case 'COMPLETED':
      bg = '#ecfdf5';
      text = '#047857';
      border = '#a7f3d0';
      Icon = CheckCircle2;
      break;

    case 'PENDING':
    case 'UNDER_REVIEW':
    case 'IN_REVIEW':
    case 'APPLIED':
    case 'OPEN':
      bg = '#fffbeb';
      text = '#b45309';
      border = '#fde68a';
      Icon = Clock;
      break;

    case 'REJECTED':
    case 'SUSPENDED':
    case 'CANCELLED':
    case 'URGENT':
      bg = '#fef2f2';
      text = '#b91c1c';
      border = '#fecaca';
      Icon = XCircle;
      break;

    case 'HIGH':
      bg = '#fff7ed';
      text = '#c2410c';
      border = '#fed7aa';
      Icon = AlertTriangle;
      break;

    case 'SUPER_ADMIN':
      bg = '#f5f3ff';
      text = '#6d28d9';
      border = '#ddd6fe';
      Icon = ShieldAlert;
      break;

    case 'MODERATOR':
      bg = '#fef3c7';
      text = '#b45309';
      border = '#fde68a';
      Icon = ShieldCheck;
      break;

    case 'ALUMNI':
      bg = '#f0fdf4';
      text = '#15803d';
      border = '#bbf7d0';
      Icon = Sparkles;
      break;

    case 'STUDENT':
      bg = '#f0f9ff';
      text = '#0369a1';
      border = '#bae6fd';
      Icon = Sparkles;
      break;

    default:
      break;
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold', className)}
      style={{
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={12} className="shrink-0" />
      <span>{displayLabel}</span>
    </span>
  );
}
