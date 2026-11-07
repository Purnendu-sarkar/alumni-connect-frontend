'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, X } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ReauthModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReauthModal({ isOpen, onSuccess, onCancel }: ReauthModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient('/auth/reauth', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setPassword('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reauth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onCancel} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 id="reauth-modal-title" className="text-base font-semibold text-slate-900">
              Admin Re-authentication
            </h3>
            <p className="text-xs text-slate-500">Security checkpoint: 15-minute operational window</p>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          This operation modifies core platform settings or user privileges. Please confirm your password to proceed.
        </p>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">Administrator Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your current password"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              <ShieldCheck className="h-4 w-4" />
              {isSubmitting ? 'Verifying…' : 'Authenticate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

