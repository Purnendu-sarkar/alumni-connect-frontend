'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  DollarSign,
  Download,
  FileText,
  Gift,
  Heart,
  HelpCircle,
  Lock,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthStore } from '@/store/auth-store';

interface Campaign {
  id: string;
  title: string;
  category: 'Scholarships' | 'Research' | 'Infrastructure';
  targetAmount: number;
  raisedAmount: number;
  donorsCount: number;
  daysRemaining: number;
  department: string;
  summary: string;
  urgent?: boolean;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: 'ai-robotics-endowment',
    title: 'Undergraduate AI & Robotics Research Endowment',
    category: 'Research',
    targetAmount: 2500000,
    raisedAmount: 1875000,
    donorsCount: 58,
    daysRemaining: 18,
    department: 'Computer Science & Engineering',
    summary:
      'Funding 4 high-performance GPU workstations, specialized sensor kits, and international IEEE conference publication grants for final-year thesis students.',
    urgent: true,
  },
  {
    id: 'merit-scholarship-2026',
    title: 'Merit & Need-Based Engineering Scholarship Fund 2026',
    category: 'Scholarships',
    targetAmount: 1200000,
    raisedAmount: 1080000,
    donorsCount: 74,
    daysRemaining: 9,
    department: 'All Engineering Departments',
    summary:
      'Covering 100% academic tuition and semester fees for 10 exceptional students who face acute financial hardship, ensuring zero dropouts.',
    urgent: true,
  },
  {
    id: 'hardware-makerspace-hub',
    title: 'IoT & Hardware Innovation Makerspace Hub',
    category: 'Infrastructure',
    targetAmount: 1500000,
    raisedAmount: 1125000,
    donorsCount: 42,
    daysRemaining: 24,
    department: 'CSE & EEE',
    summary:
      'Equipping campus laboratory with high-frequency oscilloscopes, 3D prototyping printers, and embedded test benches accessible to all engineering students.',
  },
  {
    id: 'women-in-tech-travel-grant',
    title: 'Women in Tech & Leadership Travel Grants',
    category: 'Scholarships',
    targetAmount: 600000,
    raisedAmount: 420000,
    donorsCount: 31,
    daysRemaining: 30,
    department: 'Computer Science & Engineering',
    summary:
      'Providing travel sponsorships and symposium registration for female students presenting academic papers at global ACM/IEEE conferences.',
  },
  {
    id: 'student-emergency-relief',
    title: 'Campus Emergency Student Wellbeing & Medical Aid',
    category: 'Infrastructure',
    targetAmount: 500000,
    raisedAmount: 485000,
    donorsCount: 65,
    daysRemaining: 5,
    department: 'University Wide',
    summary:
      'An instantaneous, non-repayable emergency grant pool supporting students facing sudden bereavement, critical illness, or catastrophic loss.',
    urgent: true,
  },
];

interface DonorHonor {
  id: string;
  name: string;
  batch: string;
  department: string;
  campaign: string;
  amount: number;
  tier: 'Diamond Patron' | 'Platinum Benefactor' | 'Gold Supporter' | 'Patron';
  date: string;
}

const DONORS_HONOR_ROLL: DonorHonor[] = [
  {
    id: 'd-1',
    name: 'Dr. Anisur Rahman',
    batch: 'Class of 2015',
    department: 'CSE',
    campaign: 'Undergraduate AI & Robotics Research Endowment',
    amount: 100000,
    tier: 'Diamond Patron',
    date: 'Yesterday',
  },
  {
    id: 'd-2',
    name: 'Tahmina Rahman',
    batch: 'Class of 2019',
    department: 'CSE',
    campaign: 'Women in Tech & Leadership Travel Grants',
    amount: 50000,
    tier: 'Platinum Benefactor',
    date: '2 days ago',
  },
  {
    id: 'd-3',
    name: 'Monirul Islam',
    batch: 'Class of 2020',
    department: 'EEE',
    campaign: 'IoT & Hardware Innovation Makerspace Hub',
    amount: 35000,
    tier: 'Platinum Benefactor',
    date: '3 days ago',
  },
  {
    id: 'd-4',
    name: 'Tanvir Hossain',
    batch: 'Class of 2021',
    department: 'CSE',
    campaign: 'Merit & Need-Based Engineering Scholarship Fund 2026',
    amount: 25000,
    tier: 'Gold Supporter',
    date: 'Nov 04, 2026',
  },
  {
    id: 'd-5',
    name: 'Class of 2018 Alumni Group',
    batch: 'Class of 2018',
    department: 'CSE',
    campaign: 'Merit & Need-Based Engineering Scholarship Fund 2026',
    amount: 60000,
    tier: 'Platinum Benefactor',
    date: 'Nov 01, 2026',
  },
  {
    id: 'd-6',
    name: 'Anonymous Alumnus',
    batch: 'Class of 2017',
    department: 'Business Administration',
    campaign: 'Campus Emergency Student Wellbeing & Medical Aid',
    amount: 20000,
    tier: 'Gold Supporter',
    date: 'Oct 28, 2026',
  },
];

export default function GivingPage() {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalCampaign, setActiveModalCampaign] = useState<Campaign | null>(null);

  // Modal Form State
  const [selectedTier, setSelectedTier] = useState<number>(2500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [donorBatch, setDonorBatch] = useState<string>(user?.batch || (user?.role === 'ALUMNI' ? 'Class of 2021' : ''));
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [dedicationNote, setDedicationNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'NAGAD' | 'CARD' | 'BANK'>('BKASH');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<{
    receiptId: string;
    amount: number;
    campaign: string;
    timestamp: string;
  } | null>(null);

  const filteredCampaigns = CAMPAIGNS.filter((c) => {
    if (selectedCategory === 'ALL') return true;
    return c.category.toUpperCase() === selectedCategory;
  });

  const totalRaised = CAMPAIGNS.reduce((acc, curr) => acc + curr.raisedAmount, 0);
  const totalTarget = CAMPAIGNS.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const totalDonors = CAMPAIGNS.reduce((acc, curr) => acc + curr.donorsCount, 0);

  const handleOpenContribute = (campaign: Campaign) => {
    setActiveModalCampaign(campaign);
    setSuccessReceipt(null);
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalAmount = customAmount ? parseFloat(customAmount) : selectedTier;

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessReceipt({
        receiptId: `AC-GIVE-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: finalAmount || 2500,
        campaign: activeModalCampaign?.title || 'General University Fund',
        timestamp: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }, 1000);
  };

  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
          <Heart size={14} className="text-red-500 fill-red-500" /> Alumni Giving & Endowment
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          Give back to the halls that shaped your future.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed m-0">
          Directly empower student scholarships, modernize engineering laboratories, and sponsor high-impact academic research. Every contribution directly transforms student lives with 100% institutional transparency.
        </p>
      </div>

      {/* Aggregate Financial Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
            Funds Mobilized
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-2 m-0">
            {formatBDT(totalRaised)}
          </p>
          <p className="text-xs font-semibold text-emerald-600 mt-1 m-0">
            ↑ 82% of campus funding goal
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
            Distinguished Donors
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-2 m-0">
            {totalDonors}
          </p>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Alumni across 14 countries
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
            Scholarships Awarded
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-2 m-0">
            42
          </p>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Full-tuition waivers granted
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
            Laboratories Upgraded
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-2 m-0">
            5 Facilities
          </p>
          <p className="text-xs text-slate-500 mt-1 m-0">
            AI, IoT, and Robotics Hubs
          </p>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-4">
        {[
          { key: 'ALL', label: 'All Campaigns' },
          { key: 'SCHOLARSHIPS', label: 'Scholarships' },
          { key: 'RESEARCH', label: 'Research & Labs' },
          { key: 'INFRASTRUCTURE', label: 'Campus Infrastructure' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedCategory(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
              selectedCategory === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaigns Listing Grid */}
      <div>
        <SectionHeading
          eyebrow="CURRENT INITIATIVES"
          title="Active Campus Campaigns"
          description="Select a dedicated institutional endowment to pledge your support directly to departmental programs."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredCampaigns.map((camp) => {
            const percent = Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100));

            return (
              <article
                key={camp.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant={camp.category === 'Research' ? 'warning' : 'neutral'}>
                      {camp.category}
                    </Badge>
                    {camp.urgent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Priority Need
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug m-0">
                    {camp.title}
                  </h3>

                  <p className="text-xs font-semibold text-slate-500 mt-1 m-0">
                    Dept of {camp.department}
                  </p>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed m-0">
                    {camp.summary}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-baseline justify-between text-xs font-bold">
                      <span className="text-slate-900 font-mono text-sm">
                        {formatBDT(camp.raisedAmount)}
                      </span>
                      <span className="text-slate-500 font-normal">
                        of {formatBDT(camp.targetAmount)} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span><strong>{camp.donorsCount}</strong> Donors</span>
                      <span><strong>{camp.daysRemaining}</strong> days left</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Button
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => handleOpenContribute(camp)}
                  >
                    Pledge Support
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Wall of Honor / Recent Donors */}
      <div>
        <SectionHeading
          eyebrow="WALL OF HONOR"
          title="Distinguished Alumni Patrons"
          description="Recognizing graduates and organizations supporting student advancement."
        />

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100 mt-6">
          {DONORS_HONOR_ROLL.map((donor) => (
            <div key={donor.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{donor.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {donor.tier}
                  </span>
                </div>
                <p className="text-xs text-slate-500 m-0">
                  {donor.batch} · Dept of {donor.department} · Pledged to <em>{donor.campaign}</em>
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-sm font-extrabold text-slate-900 font-mono block">
                  {formatBDT(donor.amount)}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {donor.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modal: Pledge Contribution */}
      {activeModalCampaign && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                  MAKE A CONTRIBUTION
                </span>
                <h3 className="text-base font-bold text-slate-900 m-0 leading-tight">
                  {activeModalCampaign.title}
                </h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Dept of {activeModalCampaign.department}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalCampaign(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {!successReceipt ? (
              <form onSubmit={handleContributeSubmit} className="space-y-4">
                {/* Preset Gift Amount Tiers */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    SELECT CONTRIBUTION AMOUNT (অনুদান নির্বাচন করুন)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1000, 2500, 5000, 10000].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => {
                          setSelectedTier(tier);
                          setCustomAmount('');
                        }}
                        className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all duration-150 ${
                          selectedTier === tier && !customAmount
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {formatBDT(tier)}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    placeholder="Or enter custom amount in ৳ (e.g. 25000)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedTier(0);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Donor Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sadia Rahman"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Batch / Cohort
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Class of 2020"
                      value={donorBatch}
                      onChange={(e) => setDonorBatch(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Dedication Note */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Dedication Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. In honor of Batch 2018 faculty mentors"
                    value={dedicationNote}
                    onChange={(e) => setDedicationNote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Anonymous Toggle */}
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  List my contribution anonymously on the public Wall of Honor
                </label>

                {/* Payment Channel Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Payment Gateway
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'BKASH', label: 'bKash' },
                      { key: 'NAGAD', label: 'Nagad' },
                      { key: 'CARD', label: 'Debit/Credit' },
                      { key: 'BANK', label: 'Bank Wire' },
                    ].map((method) => (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => setPaymentMethod(method.key as any)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          paymentMethod === method.key
                            ? 'bg-blue-50 border-2 border-blue-600 text-blue-700 font-bold'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  size="default"
                  disabled={isSubmitting}
                  className="w-full justify-center font-bold"
                >
                  {isSubmitting ? (
                    'Processing Secure Pledge…'
                  ) : (
                    <>
                      <Lock size={15} /> Confirm Pledge of {formatBDT(customAmount ? parseFloat(customAmount) : selectedTier)}
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* Success Receipt View */
              <div className="space-y-5 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 m-0">Thank You for Your Generosity!</h3>
                  <p className="text-xs text-slate-500 mt-1 m-0">
                    Your pledge directly advances university scholarship and student research.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Voucher Reference:</span>
                    <span className="font-mono font-bold text-slate-900">{successReceipt.receiptId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Contribution Amount:</span>
                    <span className="font-mono font-bold text-blue-600 text-sm">{formatBDT(successReceipt.amount)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Designated Fund:</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{successReceipt.campaign}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Gateway:</span>
                    <span className="font-semibold text-slate-800">{paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={() => alert(`Official tax receipt ${successReceipt.receiptId} downloaded.`)}
                  >
                    <Download size={14} /> PDF Receipt
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={() => setActiveModalCampaign(null)}
                  >
                    Done & Return
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
