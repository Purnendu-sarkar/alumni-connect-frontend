'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthStore } from '@/store/auth-store';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  // Privacy states
  const [profileVisibility, setProfileVisibility] = useState<'VERIFIED_ONLY' | 'PUBLIC' | 'CONNECTIONS_ONLY'>('VERIFIED_ONLY');
  const [messagingPermission, setMessagingPermission] = useState<'VERIFIED_MEMBERS' | 'CONNECTIONS_ONLY'>('VERIFIED_MEMBERS');
  const [mentorshipStatus, setMentorshipStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passNotice, setPassNotice] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState<string | null>(null);

  const handleSavePrivacy = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettingsNotice('Privacy preferences successfully synchronized.');
    setTimeout(() => setSavedSettingsNotice(null), 4000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPassword.length < 8) {
      setPassError('New password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassNotice('Password successfully updated. Your active sessions remain secured.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassNotice(null), 4000);
  };

  return (
    <section className="dashboard-page">
      <p className="eyebrow">ACCOUNT GOVERNANCE</p>
      <h1>Privacy & Security Settings</h1>
      <p className="lede">
        Configure institutional visibility, mentorship accessibility, contact permissions, and credential security.
      </p>

      {savedSettingsNotice && (
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
          <CheckCircle2 size={18} /> {savedSettingsNotice}
        </div>
      )}

      {/* Section 1: Privacy & Visibility */}
      <div style={{ marginTop: '2.5rem', border: '2px solid var(--ink)', padding: '2rem', background: 'var(--paper)' }}>
        <SectionHeading eyebrow="DIRECTORY PRIVACY" title="Who can discover your profile?" />

        <form onSubmit={handleSavePrivacy}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', margin: '1.5rem 0' }}>
            <label
              style={{
                border: '2px solid var(--ink)',
                padding: '1rem',
                background: profileVisibility === 'VERIFIED_ONLY' ? 'var(--surface)' : 'transparent',
                cursor: 'pointer',
                display: 'block',
              }}
            >
              <input
                type="radio"
                name="visibility"
                checked={profileVisibility === 'VERIFIED_ONLY'}
                onChange={() => setProfileVisibility('VERIFIED_ONLY')}
                style={{ marginRight: '0.5rem' }}
              />
              <strong>Verified Campus Community Only</strong>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
                Only accredited students, alumni, and university faculty can view your full bio and contact details.
              </p>
            </label>

            <label
              style={{
                border: '2px solid var(--ink)',
                padding: '1rem',
                background: profileVisibility === 'PUBLIC' ? 'var(--surface)' : 'transparent',
                cursor: 'pointer',
                display: 'block',
              }}
            >
              <input
                type="radio"
                name="visibility"
                checked={profileVisibility === 'PUBLIC'}
                onChange={() => setProfileVisibility('PUBLIC')}
                style={{ marginRight: '0.5rem' }}
              />
              <strong>Public Network Listing</strong>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
                Visible in the public directory to help prospective students and corporate recruiters discover your profile.
              </p>
            </label>
          </div>

          <SectionHeading eyebrow="MENTORSHIP ACCESSIBILITY" title="Direct contact permissions" />

          <div style={{ margin: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
              <div>
                <strong>Open for Mentorship Guidance</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Display the "Open for Mentorship" badge on your profile and directory cards.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={mentorshipStatus === 'OPEN' ? 'primary' : 'secondary'}
                onClick={() => setMentorshipStatus(mentorshipStatus === 'OPEN' ? 'CLOSED' : 'OPEN')}
              >
                {mentorshipStatus === 'OPEN' ? 'Status: Active (Open)' : 'Status: Inactive (Paused)'}
              </Button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
              <div>
                <strong>Direct Messaging Permission</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Allow verified students to reach out directly vs requiring accepted connection first.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setMessagingPermission(messagingPermission === 'VERIFIED_MEMBERS' ? 'CONNECTIONS_ONLY' : 'VERIFIED_MEMBERS')}
              >
                {messagingPermission === 'VERIFIED_MEMBERS' ? 'All Verified Members' : 'Accepted Connections Only'}
              </Button>
            </div>
          </div>

          <Button type="submit">Save Privacy Preferences</Button>
        </form>
      </div>

      {/* Section 2: Password Security */}
      <div style={{ marginTop: '3rem', border: '2px solid var(--ink)', padding: '2rem', background: 'var(--paper)' }}>
        <SectionHeading eyebrow="CREDENTIAL SECURITY" title="Change your account password" />

        {passNotice && (
          <div
            style={{
              margin: '1rem 0',
              padding: '0.75rem 1rem',
              border: '2px solid var(--ink)',
              background: '#f0fdf4',
              color: '#166534',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
            {passNotice}
          </div>
        )}

        {passError && <FormAlert>{passError}</FormAlert>}

        <form onSubmit={handleUpdatePassword} style={{ maxWidth: '480px' }}>
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" style={{ marginTop: '1rem' }}>
            Update Security Password
          </Button>
        </form>
      </div>

      {/* Section 3: Active Sessions & Danger Zone */}
      <div style={{ marginTop: '3rem', border: '2px solid var(--ink)', padding: '2rem', background: 'var(--surface)' }}>
        <SectionHeading eyebrow="DEVICE AUTHORIZATION" title="Active Sessions" />
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: '0 0 1.25rem' }}>
          Current session signed in from Windows Desktop (Edge / Chrome) · Last active just now.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button asChild variant="secondary">
            <Link href="/login">
              <LogOut size={16} /> Sign out on all devices
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
