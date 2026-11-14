'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CheckCircle2,
  GraduationCap,
  Home,
  KeyRound,
  Landmark,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { Brand } from '@/components/layout/brand';

interface RouteHeroConfig {
  bgImage: string;
  headline: ReactNode;
  description: string;
  stats: [
    { icon: ReactNode; value: string; label: string },
    { icon: ReactNode; value: string; label: string },
    { icon: ReactNode; value: string; label: string },
  ];
  pillLeft: { icon: ReactNode; text: string };
  pillRight: { icon: ReactNode; text: string };
}

const ROUTE_HERO_MAP: Record<string, RouteHeroConfig> = {
  '/login': {
    bgImage: '/images/auth-bg.jpg',
    headline: (
      <>
        Campus Gateway
        <br />
        for a <span className="text-sky-400">Lifelong Network</span>
      </>
    ),
    description:
      'Connect with verified alumni, current students and faculty. Build meaningful relationships, explore opportunities and grow together.',
    stats: [
      { icon: <Users size={18} />, value: '10,000+', label: 'Graduates' },
      { icon: <ShieldCheck size={18} />, value: '100%', label: 'Verified Community' },
      { icon: <Landmark size={18} />, value: 'Single Campus', label: 'Network' },
    ],
    pillLeft: { icon: <Shield size={14} className="text-sky-400" />, text: 'Privacy-First Academic Community' },
    pillRight: { icon: <Lock size={13} className="text-emerald-400" />, text: 'Encrypted Sessions' },
  },
  '/register': {
    bgImage: '/images/auth-register-bg.jpg',
    headline: (
      <>
        Join the Future
        <br />
        of <span className="text-sky-400">Campus Excellence</span>
      </>
    ),
    description:
      'Register your student or alumni profile to unlock campus-exclusive internships, verified mentorship, and lifelong alumni ties.',
    stats: [
      { icon: <Users size={18} />, value: 'Official', label: 'Campus Directory' },
      { icon: <ShieldCheck size={18} />, value: '100%', label: 'Accredited Profiles' },
      { icon: <GraduationCap size={18} />, value: 'Lifelong', label: 'Campus Network' },
    ],
    pillLeft: { icon: <Shield size={14} className="text-sky-400" />, text: 'Official Campus Registry' },
    pillRight: { icon: <Lock size={13} className="text-emerald-400" />, text: 'Institutional Accreditation' },
  },
  '/setup-account': {
    bgImage: '/images/auth-setup-bg.jpg',
    headline: (
      <>
        Campus Leadership
        <br />
        &amp; <span className="text-sky-400">Administration Desk</span>
      </>
    ),
    description:
      'Activate your staff, faculty, or moderator credentials to supervise student mentorship and safeguard community academic integrity.',
    stats: [
      { icon: <ShieldCheck size={18} />, value: 'Role-Based', label: 'Security Architecture' },
      { icon: <Landmark size={18} />, value: 'Campus-Wide', label: 'Supervision' },
      { icon: <Lock size={18} />, value: 'Audited', label: 'Action Logs' },
    ],
    pillLeft: { icon: <Shield size={14} className="text-sky-400" />, text: 'Multi-Role Institutional RBAC' },
    pillRight: { icon: <Lock size={13} className="text-emerald-400" />, text: '15-Min Step-Up Reauth' },
  },
  '/reset-password': {
    bgImage: '/images/auth-reset-bg.jpg',
    headline: (
      <>
        Secure Identity
        <br />
        &amp; <span className="text-sky-400">Network Credentials</span>
      </>
    ),
    description:
      'Update your secret password with institutional-grade cryptography to protect your lifelong academic profile and active sessions.',
    stats: [
      { icon: <KeyRound size={18} />, value: 'Argon2id', label: 'Password Security' },
      { icon: <ShieldCheck size={18} />, value: 'Instant', label: 'Session Revocation' },
      { icon: <Lock size={18} />, value: 'Family-ID', label: 'Token Rotation' },
    ],
    pillLeft: { icon: <Shield size={14} className="text-sky-400" />, text: 'Account Threat Shield' },
    pillRight: { icon: <Lock size={13} className="text-emerald-400" />, text: 'Cryptographic Session Guard' },
  },
  '/forgot-password': {
    bgImage: '/images/auth-forgot-bg.jpg',
    headline: (
      <>
        Seamless Access
        <br />
        &amp; <span className="text-sky-400">Account Recovery</span>
      </>
    ),
    description:
      'Request a secure, single-use password recovery link to restore immediate access to your campus messages and opportunities.',
    stats: [
      { icon: <Mail size={18} />, value: '15 Min', label: 'Single-Use Window' },
      { icon: <ShieldCheck size={18} />, value: 'Encrypted', label: 'Tamper-Proof Tokens' },
      { icon: <Landmark size={18} />, value: 'Zero Leak', label: 'Anti-Enumeration' },
    ],
    pillLeft: { icon: <Shield size={14} className="text-sky-400" />, text: 'Identity Protection Protocol' },
    pillRight: { icon: <Lock size={13} className="text-emerald-400" />, text: 'Verified Channel' },
  },
  '/verify-email': {
    bgImage: '/images/auth-verify-bg.jpg',
    headline: (
      <>
        Verified Standing
        <br />
        for <span className="text-sky-400">Every Graduate</span>
      </>
    ),
    description:
      'Validating institutional email domain records to maintain an exclusive, spam-free, university-authenticated ecosystem.',
    stats: [
      { icon: <CheckCircle2 size={18} />, value: 'Strict', label: 'Campus Domain Check' },
      { icon: <ShieldCheck size={18} />, value: 'Zero Spam', label: 'Exclusive Community' },
      { icon: <Users size={18} />, value: 'Direct', label: 'Peer Trust' },
    ],
    pillLeft: { icon: <Shield size={14} className="text-sky-400" />, text: 'Academic Integrity Verification' },
    pillRight: { icon: <Lock size={13} className="text-emerald-400" />, text: 'Accredited Access' },
  },
};

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const config = ROUTE_HERO_MAP[pathname] || ROUTE_HERO_MAP['/login'];

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[#F0F5FD] font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Brand Hero Column (Visible on lg+) matching Screenshot 3 */}
      <div
        className="hidden lg:flex lg:w-[57%] xl:w-[58%] 2xl:w-[58%] relative flex-col justify-between p-8 sm:p-10 xl:p-12 text-white overflow-hidden bg-cover bg-center shrink-0 min-h-screen transition-all duration-500 z-10"
        style={{ backgroundImage: `url('${config.bgImage}')` }}
      >
        {/* Deep Navy Gradient & Atmospheric Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F3A]/95 via-[#0B1F3A]/88 to-[#0B1F3A]/92 backdrop-brightness-95 z-0" />
        
        {/* Top-Left Circular Organic Droplet matching Screenshot 3 */}
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-[#071526]/85 backdrop-blur-xl border border-white/5 pointer-events-none z-10" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none z-0" />

        {/* ORGANIC 3-WAVE RIVER DIVIDER (কার্ডের পাশ থেকে শুরু হয়ে নদীর ৩টি মৃদু তরঙ্গে প্রবাহিত)
            - At top (y=0): Starts at x=100 (from the card's side, 0% cut at the top edge)
            - Upper section (y=0 to 90): Stays wide so header pills are 100% visible
            - Wave 1: Curves gently inward (trough at y=280, x=40)
            - Wave 2: Swells gently toward card (crest at y=520, x=74)
            - Wave 3: Curves gently inward (trough at y=760, x=38)
            - Bottom (y=1000): Ends smoothly at x=50 ("তারপরে শেষটা ঠিক আছে")! */}
        <svg
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
          className="absolute top-0 right-0 h-full w-28 sm:w-36 lg:w-44 xl:w-52 text-[#F0F5FD] fill-current z-20 pointer-events-none translate-x-[1px]"
        >
          <path d="M100,0 C100,90 40,160 40,280 C40,400 74,420 74,520 C74,640 38,660 38,760 C38,870 50,910 50,1000 L100,1000 L100,0 Z" />
        </svg>

        {/* Top Header: Brand + Verified Network Pills */}
        <div className="relative z-10 flex items-center justify-between gap-4 pr-3 sm:pr-6 lg:pr-8">
          <Brand variant="dark" stacked className="shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all shadow-xs shrink-0"
            >
              <Home size={13} />
              <span>Back to Public Home</span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-200 bg-sky-500/20 border border-sky-400/30 backdrop-blur-md shadow-xs shrink-0">
              <ShieldCheck size={14} className="text-sky-300" />
              <span>Verified Network</span>
            </div>
          </div>
        </div>

        {/* Mid Section: Value Proposition & Dynamic Academic Headline */}
        <div className="relative z-10 my-auto py-8 space-y-6 max-w-lg">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15] m-0 drop-shadow-sm">
              {config.headline}
            </h1>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal m-0 pt-1">
              {config.description}
            </p>
          </div>

          {/* Unified Stats Grid matching Screenshot 3 */}
          <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-sky-300 shrink-0">
                {config.stats[0].icon}
              </div>
              <div className="min-w-0">
                <span className="block text-base sm:text-lg font-extrabold text-white leading-tight">
                  {config.stats[0].value}
                </span>
                <span className="text-[11px] text-slate-300 font-medium truncate block">
                  {config.stats[0].label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-l border-white/15 pl-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-sky-300 shrink-0">
                {config.stats[1].icon}
              </div>
              <div className="min-w-0">
                <span className="block text-base sm:text-lg font-extrabold text-white leading-tight">
                  {config.stats[1].value}
                </span>
                <span className="text-[11px] text-slate-300 font-medium truncate block">
                  {config.stats[1].label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-l border-white/15 pl-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-sky-300 shrink-0">
                {config.stats[2].icon}
              </div>
              <div className="min-w-0">
                <span className="block text-base sm:text-lg font-extrabold text-white leading-tight">
                  {config.stats[2].value}
                </span>
                <span className="text-[11px] text-slate-300 font-medium truncate block">
                  {config.stats[2].label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating Glass Pill matching Screenshot 3 */}
        <div className="relative z-10 pt-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/15 text-xs shadow-xs">
            <div className="flex items-center gap-1.5 text-white font-medium">
              {config.pillLeft.icon}
              <span>{config.pillLeft.text}</span>
            </div>
            <span className="text-white/30">|</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              {config.pillRight.icon}
              <span>{config.pillRight.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Content Column with Fluid Waves & Soft Blue Canvas */}
      <div className="flex-1 flex flex-col justify-center items-center lg:items-start p-4 sm:p-6 lg:py-8 lg:pl-6 xl:pl-10 lg:pr-8 xl:pr-12 relative min-h-screen bg-[#F0F5FD] overflow-y-auto">
        {/* VISIBLE DECORATIVE FLUID WAVES IN BACKGROUND (Screenshot 3 Matching Background UI) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Top-Right Decorative Fluid Wave (Layer 1 - Rich Periwinkle Blue #C4D6FC) */}
          <svg
            className="absolute -top-12 -right-12 w-[460px] h-[460px] pointer-events-none"
            viewBox="0 0 500 500"
            fill="none"
          >
            <path
              d="M160,0 C280,45 410,120 460,260 C490,345 470,435 440,500 L500,500 L500,0 Z"
              fill="#C4D6FC"
              opacity="0.85"
            />
          </svg>

          {/* Top-Right Decorative Fluid Wave (Layer 2 - Light Sky Overlay #DCE7FD) */}
          <svg
            className="absolute -top-6 -right-6 w-[390px] h-[390px] pointer-events-none"
            viewBox="0 0 500 500"
            fill="none"
          >
            <path
              d="M220,0 C315,55 395,140 430,270 C455,355 425,435 400,500 L500,500 L500,0 Z"
              fill="#DCE7FD"
              opacity="0.9"
            />
          </svg>

          {/* Middle-Right Gentle Contour Wave (#D4E3FD) */}
          <svg
            className="absolute top-[28%] -right-10 w-[260px] h-[380px] pointer-events-none"
            viewBox="0 0 200 300"
            fill="none"
          >
            <path
              d="M200,0 C125,50 85,130 90,200 C95,255 135,285 200,300 Z"
              fill="#D4E3FD"
              opacity="0.75"
            />
          </svg>

          {/* Bottom-Right Decorative Fluid Wave (Sweeping up from bottom-right #BED1FC) */}
          <svg
            className="absolute -bottom-16 -right-16 w-[540px] h-[540px] pointer-events-none"
            viewBox="0 0 600 600"
            fill="none"
          >
            <path
              d="M600,160 C480,245 375,360 310,465 C270,530 230,570 160,600 L600,600 Z"
              fill="#BED1FC"
              opacity="0.8"
            />
            <path
              d="M600,240 C500,320 410,410 365,505 C335,555 305,580 250,600 L600,600 Z"
              fill="#D8E5FE"
              opacity="0.9"
            />
          </svg>

          {/* Elevated Card Ambient Drop-Shadow Backdrop (Deep Glow behind the credential card) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-[280px] w-[92%] max-w-[560px] h-[88%] max-h-[720px] bg-gradient-to-b from-blue-300/35 via-indigo-200/25 to-sky-300/40 rounded-[52px] blur-3xl pointer-events-none -z-10 translate-y-3" />
        </div>

        {/* Mobile Header (Hidden on lg+) */}
        <div className="lg:hidden w-full max-w-lg mb-6 flex items-center justify-between relative z-10">
          <Brand />
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs"
          >
            <Home size={13} /> Home
          </Link>
        </div>

        {/* Main Child View Container — Floating Elevated Card */}
        <div className="w-full flex items-center justify-center lg:justify-start relative z-10 py-6">
          {children}
        </div>
      </div>
    </main>
  );
}
