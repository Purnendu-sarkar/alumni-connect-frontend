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
    }, 1200);
  };

  const formatBDT = (amount: number) => {
    return `৳${amount.toLocaleString('en-IN')}`;
  };

  return (
    <section className="page-shell" style={{ padding: '4rem 0' }}>
      {/* Eyebrow and Page Title */}
      <p className="eyebrow eyebrow--red">ALUMNI GIVING & ENDOWMENT CAMPAIGNS</p>
      <h1 style={{ maxWidth: '900px', lineHeight: 1.1 }}>
        Give Back to the Halls that Shaped Your Future.
      </h1>
      <p className="lede" style={{ maxWidth: '820px', marginTop: '1rem' }}>
        Directly empower student scholarships, modernize engineering laboratories, and sponsor high-impact academic
        research. Every contribution directly transforms student lives with 100% institutional transparency.
      </p>

      {/* Aggregate Financial Metrics Banner */}
      <div
        style={{
          margin: '3rem 0',
          border: '3px solid var(--ink)',
          background: 'var(--paper)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          boxShadow: '6px 6px 0px 0px var(--ink)',
        }}
      >
        <div style={{ padding: '2rem', borderRight: '2px solid var(--ink)' }}>
          <p className="eyebrow" style={{ color: 'var(--muted)', marginBottom: '0.4rem' }}>
            TOTAL FUNDS MOBILIZED
          </p>
          <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, fontFamily: 'var(--display)' }}>
            {formatBDT(totalRaised)}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, marginTop: '0.4rem' }}>
            ↑ 82% of campus funding goal
          </p>
        </div>

        <div style={{ padding: '2rem', borderRight: '2px solid var(--ink)' }}>
          <p className="eyebrow" style={{ color: 'var(--muted)', marginBottom: '0.4rem' }}>
            DISTINGUISHED DONORS
          </p>
          <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, fontFamily: 'var(--display)' }}>
            {totalDonors}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
            Alumni across 14 countries
          </p>
        </div>

        <div style={{ padding: '2rem', borderRight: '2px solid var(--ink)' }}>
          <p className="eyebrow" style={{ color: 'var(--muted)', marginBottom: '0.4rem' }}>
            SCHOLARSHIPS AWARDED
          </p>
          <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, fontFamily: 'var(--display)' }}>
            42
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
            Full-tuition tuition waivers
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          <p className="eyebrow" style={{ color: 'var(--muted)', marginBottom: '0.4rem' }}>
            LABORATORIES UPGRADED
          </p>
          <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, fontFamily: 'var(--display)' }}>
            5 Facilities
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
            AI, IoT, and Robotics Hubs
          </p>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem',
          borderBottom: '2px solid var(--ink)',
          paddingBottom: '1rem',
        }}
      >
        {[
          { key: 'ALL', label: 'All Campaigns (সব ক্যাম্পেইন)' },
          { key: 'SCHOLARSHIPS', label: 'Student Scholarships (শিক্ষাবৃত্তি)' },
          { key: 'RESEARCH', label: 'Undergraduate Research & Labs (গবেষণা)' },
          { key: 'INFRASTRUCTURE', label: 'Campus Infrastructure (অবকাঠামো)' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedCategory(tab.key)}
            style={{
              padding: '0.65rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.88rem',
              border: '2px solid var(--ink)',
              background: selectedCategory === tab.key ? 'var(--ink)' : 'var(--paper)',
              color: selectedCategory === tab.key ? '#fff' : 'var(--ink)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: selectedCategory === tab.key ? 'none' : '2px 2px 0px 0px var(--ink)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaigns Listing Grid */}
      <SectionHeading
        eyebrow="CURRENT INITIATIVES"
        title="Active Campus Campaigns"
      />
      <p className="lede" style={{ marginBottom: '2rem' }}>
        Select a dedicated institutional endowment to pledge your support directly to departmental programs.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2rem',
          margin: '2rem 0 5rem',
        }}
      >
        {filteredCampaigns.map((camp) => {
          const percent = Math.min(100, Math.round((camp.raisedAmount / camp.targetAmount) * 100));

          return (
            <article
              key={camp.id}
              style={{
                border: '3px solid var(--ink)',
                background: 'var(--paper)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem',
                boxShadow: '4px 4px 0px 0px var(--ink)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    gap: '0.5rem',
                  }}
                >
                  <Badge variant={camp.category === 'Research' ? 'error' : 'neutral'}>
                    {camp.category}
                  </Badge>
                  {camp.urgent && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: 'var(--red)',
                        background: '#fee2e2',
                        border: '1px solid var(--red)',
                        padding: '0.2rem 0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Priority Need
                    </span>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    marginBottom: '0.75rem',
                    lineHeight: 1.25,
                    fontFamily: 'var(--display)',
                  }}
                >
                  {camp.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '1rem' }}>
                  Managed by Department of {camp.department}
                </p>

                <p
                  style={{
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    color: '#262626',
                    marginBottom: '1.75rem',
                  }}
                >
                  {camp.summary}
                </p>

                {/* Financial Progress Bar */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--display)' }}>
                        {formatBDT(camp.raisedAmount)}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: '0.35rem' }}>
                        raised of {formatBDT(camp.targetAmount)}
                      </span>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--ink)' }}>
                      {percent}%
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '14px',
                      background: '#e5e7eb',
                      border: '2px solid var(--ink)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: percent >= 90 ? '#16a34a' : 'var(--red)',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      marginTop: '0.6rem',
                    }}
                  >
                    <span>
                      <strong>{camp.donorsCount}</strong> Alumni Donors
                    </span>
                    <span>
                      <strong>{camp.daysRemaining}</strong> Days Remaining
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleOpenContribute(camp)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 800,
                }}
              >
                <Heart size={16} fill="currentColor" />
                PLEDGE CONTRIBUTION (দান করুন)
              </Button>
            </article>
          );
        })}
      </div>

      {/* Wall of Honor: Distinguished Alumni Benefactors */}
      <div style={{ margin: '5rem 0 3rem' }}>
        <SectionHeading
          eyebrow="DISTINGUISHED PATRONS"
          title="Alumni Wall of Honor"
        />
        <p className="lede" style={{ marginBottom: '2rem' }}>
          Recognizing the alumni leadership and graduation batches fostering excellence across campus.
        </p>

        <div
          style={{
            border: '3px solid var(--ink)',
            background: 'var(--paper)',
            boxShadow: '6px 6px 0px 0px var(--ink)',
            overflowX: 'auto',
            marginTop: '2rem',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              minWidth: '650px',
            }}
          >
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid var(--ink)' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 900, fontSize: '0.85rem' }}>BENEFACTOR</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 900, fontSize: '0.85rem' }}>GRADUATION</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 900, fontSize: '0.85rem' }}>CAMPAIGN ALLOCATED</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 900, fontSize: '0.85rem' }}>AMOUNT</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 900, fontSize: '0.85rem' }}>RECOGNITION</th>
              </tr>
            </thead>
            <tbody>
              {DONORS_HONOR_ROLL.map((donor, idx) => (
                <tr
                  key={donor.id}
                  style={{
                    borderBottom: idx < DONORS_HONOR_ROLL.length - 1 ? '1px solid #e5e7eb' : 'none',
                    background: idx % 2 === 0 ? 'var(--paper)' : '#fafafa',
                  }}
                >
                  <td style={{ padding: '1.1rem 1.25rem', fontWeight: 800 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={16} color="var(--red)" />
                      {donor.name}
                    </div>
                  </td>
                  <td style={{ padding: '1.1rem 1.25rem', fontSize: '0.88rem', color: 'var(--muted)' }}>
                    {donor.batch} ({donor.department})
                  </td>
                  <td style={{ padding: '1.1rem 1.25rem', fontSize: '0.88rem', fontWeight: 600 }}>
                    {donor.campaign}
                  </td>
                  <td
                    style={{
                      padding: '1.1rem 1.25rem',
                      fontFamily: 'var(--display)',
                      fontWeight: 900,
                      fontSize: '1.05rem',
                    }}
                  >
                    {formatBDT(donor.amount)}
                  </td>
                  <td style={{ padding: '1.1rem 1.25rem' }}>
                    <Badge variant={donor.tier.includes('Diamond') || donor.tier.includes('Platinum') ? 'error' : 'neutral'}>
                      {donor.tier}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional Transparency & Compliance Guarantee */}
      <div
        style={{
          margin: '5rem 0',
          border: '3px solid var(--ink)',
          background: '#f8fafc',
          padding: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          boxShadow: '5px 5px 0px 0px var(--ink)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={28} color="var(--red)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--display)' }}>
              100% Direct Allocation
            </h3>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#4b5563' }}>
            All contributions are directly disbursed to the dedicated University Endowment and Department Research accounts
            with zero intermediary operational cuts.
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <FileText size={28} color="var(--red)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--display)' }}>
              Audited Semester Reports
            </h3>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#4b5563' }}>
            Every donor receives an itemized, digitally signed fiscal audit report specifying student awardees, equipment
            serial numbers, and thesis publication proofs.
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Lock size={28} color="var(--red)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--display)' }}>
              Bank-Grade Encryption
            </h3>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#4b5563' }}>
            Pledge transactions are tokenized with 256-bit SSL encryption. Tax-deductible institutional receipts are
            generated instantaneously upon verification.
          </p>
        </div>
      </div>

      {/* Interactive Modal: Pledge Contribution */}
      {activeModalCampaign && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--paper)',
              border: '3px solid var(--ink)',
              maxWidth: '620px',
              width: '100%',
              padding: '2.5rem',
              boxShadow: '10px 10px 0px 0px var(--ink)',
              maxHeight: '92vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalCampaign(null)}
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              <X size={24} />
            </button>

            {!successReceipt ? (
              <form onSubmit={handleContributeSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p className="eyebrow eyebrow--red" style={{ marginBottom: '0.35rem' }}>
                    MAKE A CONTRIBUTION
                  </p>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--display)', lineHeight: 1.2 }}>
                    {activeModalCampaign.title}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                    Department of {activeModalCampaign.department}
                  </p>
                </div>

                {/* Preset Gift Amount Tiers */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                    SELECT CONTRIBUTION AMOUNT (অনুদান নির্বাচন করুন)
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {[1000, 2500, 5000, 10000].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => {
                          setSelectedTier(tier);
                          setCustomAmount('');
                        }}
                        style={{
                          padding: '0.75rem 0.5rem',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          fontFamily: 'var(--display)',
                          border: '2px solid var(--ink)',
                          background: selectedTier === tier && !customAmount ? 'var(--ink)' : '#fff',
                          color: selectedTier === tier && !customAmount ? '#fff' : 'var(--ink)',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease',
                        }}
                      >
                        {formatBDT(tier)}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    placeholder="Or enter custom amount (e.g. 25000)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedTier(0);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid var(--ink)',
                      fontWeight: 700,
                      background: '#fff',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>

                {/* Donor Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sadia Rahman"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid var(--ink)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      BATCH / AFFILIATION
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Class of 2020"
                      value={donorBatch}
                      onChange={(e) => setDonorBatch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid var(--ink)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                      }}
                    />
                  </div>
                </div>

                {/* Dedication Note */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    DEDICATION OR ENCOURAGEMENT MESSAGE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dedicated in honor of CSE Batch 2018 faculty mentors"
                    value={dedicationNote}
                    onChange={(e) => setDedicationNote(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid var(--ink)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                {/* Anonymous Toggle */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--ink)' }}
                  />
                  List my contribution anonymously on the Public Wall of Honor
                </label>

                {/* Payment Gateway Selector */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    PAYMENT CHANNEL
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {[
                      { key: 'BKASH', label: 'bKash' },
                      { key: 'NAGAD', label: 'Nagad' },
                      { key: 'CARD', label: 'Card' },
                      { key: 'BANK', label: 'EFT Bank' },
                    ].map((method) => (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => setPaymentMethod(method.key as any)}
                        style={{
                          padding: '0.65rem 0.25rem',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          border: '2px solid var(--ink)',
                          background: paymentMethod === method.key ? '#fee2e2' : '#fff',
                          color: paymentMethod === method.key ? 'var(--red)' : 'var(--ink)',
                          borderColor: paymentMethod === method.key ? 'var(--red)' : 'var(--ink)',
                          cursor: 'pointer',
                        }}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 900,
                    fontSize: '1rem',
                  }}
                >
                  {isSubmitting ? (
                    'PROCESSING SECURE TRANSACTION...'
                  ) : (
                    <>
                      <Lock size={18} />
                      CONFIRM PLEDGE OF {formatBDT(customAmount ? parseFloat(customAmount) : selectedTier)}
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* Success Receipt View */
              <div>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      color: '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      border: '3px solid var(--ink)',
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--display)' }}>
                    Thank You for Your Generosity!
                  </h2>
                  <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                    Your pledge directly advances university scholarship and academic excellence.
                  </p>
                </div>

                {/* Official Digital Voucher */}
                <div
                  style={{
                    border: '2px dashed var(--ink)',
                    background: '#f9fafb',
                    padding: '1.5rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #d1d5db',
                      paddingBottom: '0.75rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Receipt Voucher #</span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{successReceipt.receiptId}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #d1d5db',
                      paddingBottom: '0.75rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Contribution Amount</span>
                    <span style={{ fontWeight: 900, fontFamily: 'var(--display)', fontSize: '1.2rem' }}>
                      {formatBDT(successReceipt.amount)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #d1d5db',
                      paddingBottom: '0.75rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Designated Fund</span>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', textAlign: 'right', maxWidth: '280px' }}>
                      {successReceipt.campaign}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #d1d5db',
                      paddingBottom: '0.75rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Payment Channel</span>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{paymentMethod} Gateway</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Timestamp & Verification</span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {successReceipt.timestamp}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => alert(`Official tax receipt ${successReceipt.receiptId} downloaded.`)}
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Download size={16} />
                    Download PDF Receipt
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setActiveModalCampaign(null)}
                    style={{ flex: 1 }}
                  >
                    Done & Return
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
