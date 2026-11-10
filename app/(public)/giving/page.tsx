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
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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

      {/* Aggregate Financial Metrics using shadcn Card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
            Funds Mobilized
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-2 m-0">
            {formatBDT(totalRaised)}
          </p>
          <p className="text-xs font-semibold text-emerald-600 mt-1 m-0">
            ↑ 82% of campus funding goal
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
            Distinguished Donors
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-2 m-0">
            {totalDonors}
          </p>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Alumni across 14 countries
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
            Scholarships Awarded
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-2 m-0">
            42
          </p>
          <p className="text-xs text-slate-500 mt-1 m-0">
            Full-tuition waivers granted
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
            Laboratories Upgraded
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-2 m-0">
            5 Facilities
          </p>
          <p className="text-xs text-slate-500 mt-1 m-0">
            AI, IoT, and Robotics Hubs
          </p>
        </Card>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-4">
        {[
          { key: 'ALL', label: 'All Campaigns' },
          { key: 'SCHOLARSHIPS', label: 'Scholarships' },
          { key: 'RESEARCH', label: 'Research & Labs' },
          { key: 'INFRASTRUCTURE', label: 'Campus Infrastructure' },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={selectedCategory === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Campaigns Listing Grid using shadcn Card & Progress */}
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
              <Card
                key={camp.id}
                className="flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <div>
                  <CardHeader className="p-0 mb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={camp.category === 'Research' ? 'warning' : 'neutral'}>
                        {camp.category}
                      </Badge>
                      {camp.urgent && (
                        <Badge variant="destructive">Priority Need</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug m-0">
                      {camp.title}
                    </h3>

                    <p className="text-xs font-semibold text-slate-500 m-0">
                      Dept of {camp.department}
                    </p>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed m-0">
                      {camp.summary}
                    </p>

                    {/* Progress with shadcn Progress */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-baseline justify-between text-xs font-bold">
                        <span className="text-slate-900 font-mono text-sm">
                          {formatBDT(camp.raisedAmount)}
                        </span>
                        <span className="text-slate-500 font-normal">
                          of {formatBDT(camp.targetAmount)} ({percent}%)
                        </span>
                      </div>

                      <Progress value={percent} className="h-2.5" />

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span><strong>{camp.donorsCount}</strong> Donors</span>
                        <span><strong>{camp.daysRemaining}</strong> days left</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="p-0 pt-4 mt-6 border-t border-slate-100">
                  <Button
                    size="sm"
                    className="w-full justify-center font-bold"
                    onClick={() => handleOpenContribute(camp)}
                  >
                    Pledge Support
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Wall of Honor using shadcn Card */}
      <div>
        <SectionHeading
          eyebrow="WALL OF HONOR"
          title="Distinguished Alumni Patrons"
          description="Recognizing graduates and organizations supporting student advancement."
        />

        <Card className="p-0 divide-y divide-slate-100 overflow-hidden mt-6">
          {DONORS_HONOR_ROLL.map((donor) => (
            <div key={donor.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{donor.name}</span>
                  <Badge variant="warning">{donor.tier}</Badge>
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
        </Card>
      </div>

      {/* Reusable shadcn Dialog: Pledge Contribution */}
      <Dialog open={Boolean(activeModalCampaign)} onOpenChange={(open) => !open && setActiveModalCampaign(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-mono">
              MAKE A CONTRIBUTION
            </span>
            <DialogTitle>
              {activeModalCampaign?.title}
            </DialogTitle>
            <DialogDescription>
              Dept of {activeModalCampaign?.department}
            </DialogDescription>
          </DialogHeader>

          {!successReceipt ? (
            <form onSubmit={handleContributeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>SELECT CONTRIBUTION AMOUNT (অনুদান নির্বাচন করুন)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[1000, 2500, 5000, 10000].map((tier) => (
                    <Button
                      key={tier}
                      type="button"
                      variant={selectedTier === tier && !customAmount ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedTier(tier);
                        setCustomAmount('');
                      }}
                      className="font-mono font-bold"
                    >
                      {formatBDT(tier)}
                    </Button>
                  ))}
                </div>

                <Input
                  type="number"
                  placeholder="Or enter custom amount in ৳ (e.g. 25000)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedTier(0);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="donor-name">Full Name *</Label>
                  <Input
                    id="donor-name"
                    required
                    placeholder="e.g. Sadia Rahman"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="donor-batch">Batch / Cohort</Label>
                  <Input
                    id="donor-batch"
                    placeholder="e.g. Class of 2020"
                    value={donorBatch}
                    onChange={(e) => setDonorBatch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="dedication">Dedication Note (Optional)</Label>
                <Input
                  id="dedication"
                  placeholder="e.g. In honor of Batch 2018 faculty mentors"
                  value={dedicationNote}
                  onChange={(e) => setDedicationNote(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                List my contribution anonymously on the public Wall of Honor
              </label>

              <div className="space-y-1.5">
                <Label>Payment Gateway</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'BKASH', label: 'bKash' },
                    { key: 'NAGAD', label: 'Nagad' },
                    { key: 'CARD', label: 'Card' },
                    { key: 'BANK', label: 'Bank' },
                  ].map((method) => (
                    <Button
                      key={method.key}
                      type="button"
                      variant={paymentMethod === method.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod(method.key as any)}
                    >
                      {method.label}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter>
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
              </DialogFooter>
            </form>
          ) : (
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

              <Card className="p-4 text-left space-y-2 text-xs bg-slate-50">
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
              </Card>

              <DialogFooter className="flex items-center gap-3">
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
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
