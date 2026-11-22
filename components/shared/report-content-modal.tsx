'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Flag, ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { submitReport, type ReportTargetType, type ReportType } from '@/lib/api/reports.api';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { useAuthStore } from '@/store/auth-store';

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetName?: string;
  onSuccess?: () => void;
}

const REPORT_TYPE_OPTIONS: { value: ReportType; label: string; description: string }[] = [
  {
    value: 'HARASSMENT',
    label: 'Harassment or Bullying',
    description: 'Targeted hostility, intimidation, offensive remarks, or unwanted contact.',
  },
  {
    value: 'INAPPROPRIATE_CONTENT',
    label: 'Inappropriate or Explicit Content',
    description: 'Unacceptable language, vulgar imagery, or code-of-conduct violations.',
  },
  {
    value: 'MISLEADING_JOB',
    label: 'Fraudulent or Misleading Posting',
    description: 'Fake salary, advance fee requests, scam opportunities, or deceptive claims.',
  },
  {
    value: 'FAKE_PROFILE',
    label: 'Impersonation or False Identity',
    description: 'Misrepresenting graduation status, credentials, identity, or affiliation.',
  },
  {
    value: 'SPAM',
    label: 'Spam or Commercial Solicitation',
    description: 'Unsolicited mass marketing, automated bot behavior, or referral spam.',
  },
  {
    value: 'OTHER',
    label: 'Other University Policy Concern',
    description: 'Any other safety or code-of-conduct concern requiring staff review.',
  },
];

export function ReportContentModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onSuccess,
}: ReportContentModalProps) {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [type, setType] = useState<ReportType>('INAPPROPRIATE_CONTENT');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setErrorMessage('Please provide a specific reason of at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitReport(
        {
          targetType,
          targetId,
          type,
          reason: reason.trim(),
          details: details.trim() || undefined,
        },
        accessToken,
      );

      setSuccessMessage('Thank you. Your confidential report has been submitted to campus moderators for review.');
      setReason('');
      setDetails('');
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2500);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Failed to submit report. Please try again.');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">
                Report {targetType.toLowerCase() === 'user' ? 'Member' : targetType.toLowerCase()}
              </h3>
              <p className="text-[11px] text-slate-500 m-0">
                {targetName ? `Target: ${targetName}` : 'Confidential review by university moderators'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {successMessage ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold m-0 text-xs">Report Submitted</p>
                <p className="mt-1 m-0 text-[11px] leading-relaxed text-emerald-700">{successMessage}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Policy Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Violation Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {REPORT_TYPE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        type === opt.value
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportType"
                        value={opt.value}
                        checked={type === opt.value}
                        onChange={() => setType(opt.value)}
                        className="mt-0.5 text-blue-600"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">{opt.label}</span>
                        <span className="text-slate-500 text-[10px] block leading-tight">{opt.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Primary Reason */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Reason for Flagging <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${reason.trim().length < 10 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {reason.trim().length}/10 min chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Summarize the core policy violation (e.g. unsolicited spam messages or false credentials)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Details / Evidence (Optional)
                </label>
                <textarea
                  rows={2}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Include any relevant timestamps, exact quotes, or helpful details for moderators..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Anonymity note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Privacy Guarantee:</span> Your identity as the reporter is strictly confidential and is never disclosed to the reported member.
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-xs"
                  disabled={isSubmitting || reason.trim().length < 10}
                >
                  <Flag size={13} />
                  <span>{isSubmitting ? 'Submitting…' : 'Submit Incident Report'}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
