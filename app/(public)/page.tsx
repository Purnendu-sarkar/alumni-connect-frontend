import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Lock,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950 pointer-events-none" />
        
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300 mb-8 backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>Official University Alumni & Student Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Your university community,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              connected in one trusted place.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Connect directly with verified alumni, discover career opportunities, receive mentorship,
            and build lasting professional relationships within your alma mater.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
            >
              <span>Join the Network</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              Sign In to Your Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Built for Institutional Trust
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Designed exclusively for our students and graduates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 p-8 shadow-sm hover:border-blue-200 hover:shadow-md transition">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Verified Alumni Directory</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect with graduates working at top companies worldwide. Search by batch,
                department, company, and specialized skills in a privacy-first environment.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-8 shadow-sm hover:border-blue-200 hover:shadow-md transition">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Moderated Opportunity Board</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access curated job and internship openings posted directly by alumni and vetted by
                university moderators before publication.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-8 shadow-sm hover:border-blue-200 hover:shadow-md transition">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Institutional Privacy & Security</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Zero third-party trackers or public data scraping. Every profile requires institutional
                verification by our administration before gaining full access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Segments Banner */}
      <section className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4 rounded-xl bg-white p-6 border border-slate-200">
              <div className="rounded-lg bg-blue-100 p-3 text-blue-600 shrink-0">
                <School className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">For Current Students</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Find alumni mentors, get career advice, prepare for interviews, and discover entry-level
                  openings with alumni referrals.
                </p>
                <Link
                  href="/register"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <span>Student Sign Up</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-white p-6 border border-slate-200">
              <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600 shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-slate-900">For Alumni</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Give back to your university, post job openings at your company, mentor the next
                  generation, and stay connected with your graduating class.
                </p>
                <Link
                  href="/register"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <span>Alumni Registration</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
