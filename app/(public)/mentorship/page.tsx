'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
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
import { Label } from '@/components/ui/label';
import { SectionHeading } from '@/components/ui/section-heading';
import { Textarea } from '@/components/ui/textarea';
import { CardGridSkeleton } from '@/components/dashboard/loading-skeleton';
import { searchDirectory, type DirectoryMemberCard } from '@/lib/api/directory.api';
import { sendMentorshipRequest } from '@/lib/api/mentorship.api';
import { stripHtmlToPlainText } from '@/lib/utils/text';
import { getApiErrorMessage } from '@/lib/api/error-utils';
import { useAuthStore } from '@/store/auth-store';

export default function MentorshipHubPage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [requestMentor, setRequestMentor] = useState<DirectoryMemberCard | null>(null);
  const [topic, setTopic] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [message, setMessage] = useState('');
  const [preferredCommunication, setPreferredCommunication] = useState('Google Meet / Video Call');
  const [availability, setAvailability] = useState('Weekends');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When user is authenticated as STUDENT or ALUMNI, query real alumni mentors
  const { data: directoryData, isLoading } = useQuery<DirectoryMemberCard[]>({
    queryKey: ['public-mentorship-mentors'],
    queryFn: async () => {
      const res = await searchDirectory(accessToken, {
        mentorship: 'OPEN',
        group: 'alumni',
        limit: 12,
      });
      if (!res.success || !res.data) return [];
      return res.data;
    },
    enabled: Boolean(accessToken && (user?.role === 'STUDENT' || user?.role === 'ALUMNI')),
  });

  const mentors = directoryData || [];

  const mentorshipMutation = useMutation({
    mutationFn: async (input: {
      mentorId: string;
      topic: string;
      careerGoal: string;
      message: string;
      preferredCommunication: string;
      availability: string;
    }) => {
      const res = await sendMentorshipRequest(accessToken, input);
      if (!res.success) {
        throw new Error(res.message || 'Failed to send mentorship proposal');
      }
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mentorship'] });
      setSubmittedMessage(
        `Your mentorship inquiry for "${topic}" was successfully delivered to ${requestMentor?.name}! Check your dashboard for responses.`
      );
      setRequestMentor(null);
      setTopic('');
      setCareerGoal('');
      setMessage('');
      setTimeout(() => setSubmittedMessage(null), 6000);
    },
    onError: (err: unknown) => {
      setErrorMessage(getApiErrorMessage(err, 'Failed to submit mentorship inquiry.'));
      setTimeout(() => setErrorMessage(null), 6000);
    },
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestMentor) return;
    mentorshipMutation.mutate({
      mentorId: requestMentor.id,
      topic: topic.trim(),
      careerGoal: careerGoal.trim(),
      message: message.trim(),
      preferredCommunication,
      availability,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Page Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono uppercase tracking-wider">
          <HeartHandshake size={14} /> Institutional Mentorship Program
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight m-0">
          Mentorship that moves careers forward.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed m-0">
          Direct 1-on-1 guidance from established university graduates. Receive portfolio feedback, system design coaching, mock interview prep, and career roadmaps from industry practitioners.
        </p>
      </div>

      {submittedMessage && (
        <Alert variant="success" className="animate-in fade-in duration-200">
          <CheckCircle2 size={16} />
          <AlertTitle>Request Dispatched Successfully</AlertTitle>
          <AlertDescription>{submittedMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="animate-in fade-in duration-200">
          <AlertTitle>Request Submission Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* 3 Steps Overview using shadcn Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-blue-300 transition-all p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs font-mono mb-2">
            01
          </div>
          <h3 className="text-base font-bold text-slate-900 m-0">Find by Specialization</h3>
          <p className="text-xs text-slate-600 leading-relaxed m-0 mt-1">
            Browse verified mentors based on their real industry stack, company experience, and technical specialization.
          </p>
        </Card>

        <Card className="hover:border-blue-300 transition-all p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs font-mono mb-2">
            02
          </div>
          <h3 className="text-base font-bold text-slate-900 m-0">Send a Focused Ask</h3>
          <p className="text-xs text-slate-600 leading-relaxed m-0 mt-1">
            Share your specific challenge—whether it is distributed architecture, resume reviews, or graduate school direction.
          </p>
        </Card>

        <Card className="hover:border-blue-300 transition-all p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs font-mono mb-2">
            03
          </div>
          <h3 className="text-base font-bold text-slate-900 m-0">Grow & Pay It Forward</h3>
          <p className="text-xs text-slate-600 leading-relaxed m-0 mt-1">
            Connect 1-on-1, build a lifelong peer relationship, and eventually mentor the next graduating campus cohort.
          </p>
        </Card>
      </div>

      {/* Mentors Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <SectionHeading
            eyebrow="ACCREDITED MENTORS"
            title="University Alumni Open for Mentorship"
            description="Verified graduates committed to guiding enrolled campus students."
          />
          {user ? (
            <Button asChild size="sm">
              <Link href={user.role === 'STUDENT' ? '/student/directory?mentorship=OPEN' : '/alumni/mentorship'}>
                Go to Mentorship Workspace <ArrowRight size={14} />
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign in to Browse Mentors</Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <CardGridSkeleton count={4} />
        ) : mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor: DirectoryMemberCard) => (
              <Card
                key={mentor.id}
                className="flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-200 p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={mentor.name} src={mentor.avatarUrl} size="md" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 m-0">{mentor.name}</h3>
                        <p className="text-xs text-slate-500 m-0">
                          {mentor.department || 'Alumni'} {mentor.batch ? `· Class of ${mentor.batch}` : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant={mentor.mentorshipBadge === 'OPEN' ? 'success' : 'neutral'}>
                      {mentor.mentorshipBadge === 'OPEN' ? 'Open' : 'At Capacity'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-xs font-bold text-slate-800 m-0">{mentor.position || 'Professional'}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 m-0">
                        <Building2 size={13} className="text-slate-400" />
                        {mentor.currentCompany || 'Industry'}
                      </p>
                    </div>

                    {mentor.skills && mentor.skills.length > 0 ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                          Key Expertise
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {mentor.skills.slice(0, 4).map((skill: string) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-semibold"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {mentor.bio ? (
                      <p className="text-xs text-slate-600 line-clamp-2 m-0 italic">
                        &quot;{stripHtmlToPlainText(mentor.bio)}&quot;
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {user?.role === 'STUDENT' ? (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={mentor.mentorshipBadge !== 'OPEN'}
                      onClick={() => setRequestMentor(mentor)}
                    >
                      Propose Mentorship
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link
                        href={
                          !user
                            ? '/login'
                            : user.role === 'ALUMNI'
                            ? `/alumni/directory/${mentor.id}`
                            : user.role === 'SUPER_ADMIN'
                            ? `/admin/users/${mentor.id}`
                            : `/student/directory/${mentor.id}`
                        }
                      >
                        {user ? 'View Profile' : 'Sign in to Connect'}
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
            <GraduationCap size={32} className="mx-auto text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 m-0">
              Campus Mentorship Network
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto m-0">
              {user
                ? 'No alumni mentors are currently available in this filter. Check back soon as new cohorts open for guidance!'
                : 'Sign in with your verified campus student or alumni account to browse our comprehensive mentorship directory.'}
            </p>
            {!user ? (
              <div className="pt-2">
                <Button asChild size="sm">
                  <Link href="/login">Sign in with Campus ID</Link>
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Propose Mentorship Dialog */}
      <Dialog open={Boolean(requestMentor)} onOpenChange={(open) => !open && setRequestMentor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 font-mono">
              STRUCTURED MENTORSHIP
            </span>
            <DialogTitle>Request Guidance from {requestMentor?.name}</DialogTitle>
            <DialogDescription>
              {requestMentor?.position} at {requestMentor?.currentCompany}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendRequest} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="m-topic" className="text-xs font-bold text-slate-700">
                Focus Area / Topic
              </Label>
              <input
                id="m-topic"
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Distributed Systems & System Design Prep"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="m-goal" className="text-xs font-bold text-slate-700">
                Career Goal / Target
              </Label>
              <input
                id="m-goal"
                type="text"
                required
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. Preparing for Backend Engineer roles at tech companies"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="m-comm" className="text-xs font-bold text-slate-700">
                  Communication
                </Label>
                <select
                  id="m-comm"
                  value={preferredCommunication}
                  onChange={(e) => setPreferredCommunication(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Google Meet / Video Call">Video Call</option>
                  <option value="Direct In-App Messaging">Chat</option>
                  <option value="Async Email Review">Email</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="m-avail" className="text-xs font-bold text-slate-700">
                  Availability
                </Label>
                <select
                  id="m-avail"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Weekends">Weekends</option>
                  <option value="Weekday Evenings">Evenings</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="m-message" className="text-xs font-bold text-slate-700">
                Inquiry Statement & Background
              </Label>
              <Textarea
                id="m-message"
                rows={4}
                required
                placeholder="Introduce yourself, your academic progress, and what concrete guidance you are seeking from this mentor."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setRequestMentor(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={mentorshipMutation.isPending}>
                {mentorshipMutation.isPending ? 'Delivering…' : 'Deliver Mentorship Proposal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}