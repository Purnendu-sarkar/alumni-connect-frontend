'use client';

import { useEffect, useState } from 'react';
import { Award, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react';
import { LandingAuthCtas } from '@/components/public/landing-auth-ctas';
import { SafeRemoteImage } from '@/components/shared/safe-remote-image';
import type { PublicAlumnus, PublicMetrics } from '@/lib/api/public.api';

interface HeroSplitSectionProps {
  metrics: PublicMetrics;
  featuredAlumni: PublicAlumnus[];
  heroBannerUrl?: string | null;
}

export function HeroSplitSection({
  metrics,
  featuredAlumni,
  heroBannerUrl,
}: HeroSplitSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayBanner =
    heroBannerUrl ||
    'https://res.cloudinary.com/a1dumxpe/image/upload/alumni-connect/events/banners/banner_4.jpg';

  return (
    <section className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-16">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 -mt-16 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Institutional Value Proposition & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>OFFICIAL NETWORK · NORTH WESTERN UNIVERSITY</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08] m-0">
              Your next big career move has a <span className="text-blue-600">familiar face</span>.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed m-0">
              Connect with {metrics.alumniCount.toLocaleString()}+ verified North Western University graduates across top-tier industries. Gain authentic mentorship, access unadvertised job openings, and strengthen our lifelong university community.
            </p>

            <div className="pt-2">
              <LandingAuthCtas variant="hero" />
            </div>

            {/* Social Proof: Avatars & Institutional Verification */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex -space-x-2 overflow-hidden items-center">
                {featuredAlumni.slice(0, 4).map((alumnus, idx) => (
                  <div
                    key={alumnus.id || idx}
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white overflow-hidden bg-slate-200 shrink-0"
                  >
                    <SafeRemoteImage
                      src={alumnus.avatarUrl ?? undefined}
                      alt={alumnus.name}
                      fallbackSrc={`https://res.cloudinary.com/a1dumxpe/image/upload/alumni-connect/avatars/verified/male_${(idx % 3) + 1}.jpg`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>
                  Joined by <strong className="text-slate-900">{metrics.totalMembers.toLocaleString()}+</strong> verified NWU students & graduates
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Media Showcase with Floating Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Visual Frame */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl bg-slate-900 aspect-4/3 sm:aspect-5/4">
                <SafeRemoteImage
                  src={displayBanner}
                  alt="North Western University Campus & Career Conclave"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Bottom Card Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/30 backdrop-blur-md border border-blue-400/40 text-[11px] font-semibold text-blue-200">
                    <Sparkles size={12} className="text-blue-300" />
                    CAMPUS CAREER CONCLAVE
                  </div>
                  <h3 className="text-lg font-bold text-white m-0">
                    Annual Placement & Engineering Symposium
                  </h3>
                  <p className="text-xs text-slate-300 m-0 line-clamp-1">
                    Connecting graduating cohorts with tech architects & corporate leaders.
                  </p>
                </div>
              </div>

              {/* Floating Glassmorphic Badge 1: Top-Right */}
              <div className="absolute -top-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3.5 shadow-xl animate-float flex items-center gap-3 z-20">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 m-0">
                    Verified Opportunities
                  </p>
                  <p className="text-xs font-bold text-slate-900 m-0">
                    {metrics.publishedJobsCount.toLocaleString()}+ Live Positions
                  </p>
                </div>
              </div>

              {/* Floating Glassmorphic Badge 2: Bottom-Left */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3.5 shadow-xl animate-float-delayed flex items-center gap-3 z-20">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 m-0">
                    Institutional Trust
                  </p>
                  <p className="text-xs font-bold text-slate-900 m-0">
                    100% Accredited NWU Profiles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
