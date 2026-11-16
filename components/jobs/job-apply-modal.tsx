'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileText, Loader2, Send, UploadCloud, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { applyToJob, uploadResume } from '@/lib/api/jobs.api';
import { useAuthStore } from '@/store/auth-store';
import type { Job } from '@/types/domain';

interface JobApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (jobTitle: string) => void;
}

export function JobApplyModal({ job, isOpen, onClose, onSuccess }: JobApplyModalProps) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadedResumeKey, setUploadedResumeKey] = useState<string | null>(null);
  const [uploadedResumeName, setUploadedResumeName] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [shareProfileConsent, setShareProfileConsent] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen || !job) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setFormError('Only PDF documents (.pdf) are accepted for verified resume uploads.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Resume PDF file size must be less than 5 MB.');
      return;
    }

    setFormError(null);
    setResumeFile(file);
    setIsUploadingFile(true);

    try {
      const res = await uploadResume(accessToken, file);
      if (res.data?.key) {
        setUploadedResumeKey(res.data.key);
        setUploadedResumeName(file.name);
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to securely upload resume document.');
      setResumeFile(null);
      setUploadedResumeKey(null);
      setUploadedResumeName(null);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setUploadedResumeKey(null);
    setUploadedResumeName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (job.requireCoverLetter && (!coverLetter || coverLetter.trim().length < 20)) {
      setFormError('A detailed cover note of at least 20 characters is required for this role.');
      return;
    }

    if (job.requireResume && !uploadedResumeKey) {
      setFormError('A verified PDF resume upload is mandatory for this application.');
      return;
    }

    try {
      await applyToJob(accessToken, job.id, {
        coverLetter: coverLetter.trim() || undefined,
        message: coverLetter.trim() || undefined,
        resumeKey: uploadedResumeKey || undefined,
        shareProfileConsent,
      });

      queryClient.invalidateQueries({ queryKey: ['published-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', job.id] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });

      onSuccess?.(job.title);
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit application. Please verify details and try again.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div>
            <span className="inline-block text-[11px] font-bold font-mono uppercase tracking-wider text-blue-400 mb-1">
              CAMPUS APPLICATION DESK
            </span>
            <h2 id="apply-modal-title" className="text-xl font-extrabold tracking-tight text-white m-0">
              Apply for {job.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1 m-0">
              {job.company} · {job.location || 'Remote'} · {job.employmentType || 'Full-time'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {formError && <FormAlert>{formError}</FormAlert>}

          {/* Cover Letter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="cover-letter" className="text-xs font-bold text-slate-700">
                Cover Note / Message to Alumni Poster {job.requireCoverLetter && <span className="text-rose-500">*</span>}
              </label>
              <span className="text-[11px] text-slate-400">
                {coverLetter.length} characters
              </span>
            </div>
            <textarea
              id="cover-letter"
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Highlight your academic focus, relevant coursework, thesis projects, and why you are excited for this opportunity…"
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none text-slate-800"
              required={job.requireCoverLetter}
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Curriculum Vitae / Resume (PDF) {job.requireResume && <span className="text-rose-500">*</span>}
            </label>

            {uploadedResumeKey ? (
              <div className="flex items-center justify-between p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText size={18} className="text-blue-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate m-0">
                      {uploadedResumeName || 'Resume.pdf'}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium m-0 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Securely encrypted and ready for review
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold ml-2 shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-5 text-center transition-colors">
                <input
                  type="file"
                  id="resume-file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  disabled={isUploadingFile}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                  {isUploadingFile ? (
                    <>
                      <Loader2 size={24} className="text-blue-600 animate-spin" />
                      <p className="text-xs font-bold text-slate-700 m-0">Uploading and encrypting PDF…</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={24} className="text-slate-400" />
                      <p className="text-xs font-bold text-slate-700 m-0">
                        Click or drag PDF resume here
                      </p>
                      <p className="text-[11px] text-slate-400 m-0">
                        PDF up to 5 MB. Authenticated campus recruiter access only.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Privacy Consent Checkbox */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="profile-consent"
              checked={shareProfileConsent}
              onChange={(e) => setShareProfileConsent(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
            />
            <label htmlFor="profile-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
              <strong>Share Verified Academic Profile Snapshot:</strong> Grant the verified alumni job poster access to view your academic department, batch, verified student status, and university email alongside this application.
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isUploadingFile || (job.requireResume && !uploadedResumeKey)}
            >
              <Send size={14} /> Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
