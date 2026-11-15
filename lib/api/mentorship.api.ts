import { apiClient } from './client';

export interface MentorshipPartnerSummary {
  id: string;
  name: string;
  avatarUrl?: string | null;
  department?: string | null;
  currentCompany?: string | null;
  position?: string | null;
  batch?: string | null;
  email?: string | null;
}

export interface MentorshipItem {
  id: string;
  mentorId: string;
  menteeId: string;
  topic: string;
  careerGoal: string;
  message: string;
  preferredCommunication: string;
  availability: string;
  expectedDuration?: string | null;
  status:
    | 'REQUESTED'
    | 'CLARIFICATION_REQUESTED'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'REJECTED'
    | 'PENDING'
    | 'ACCEPTED';
  clarificationQuestion?: string | null;
  clarificationReply?: string | null;
  decisionNote?: string | null;
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  endedById?: string | null;
  endNote?: string | null;
  alumniNote?: string | null; // strictly undefined when viewer is mentee
  createdAt: string;
  updatedAt: string;
  mentor?: MentorshipPartnerSummary;
  mentee?: MentorshipPartnerSummary;
}

export interface MentorshipStats {
  totalActive: number;
  totalRequested: number;
  totalCompleted: number;
  totalCancelled: number;
  totalRejected: number;
  totalMentorships: number;
}

export function getMyMentorships(
  accessToken: string | null,
  params: {
    group?: 'requests' | 'active' | 'history';
    status?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const searchParams = new URLSearchParams();
  if (params.group) searchParams.set('group', params.group);
  if (params.status) searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  return apiClient<MentorshipItem[]>(`/mentorship?${searchParams.toString()}`, { accessToken });
}

export function getMentorshipById(accessToken: string | null, id: string) {
  return apiClient<MentorshipItem>(`/mentorship/${id}`, { accessToken });
}

export function sendMentorshipRequest(
  accessToken: string | null,
  input: {
    mentorId: string;
    topic: string;
    careerGoal: string;
    message: string;
    preferredCommunication: string;
    availability: string;
    expectedDuration?: string;
  },
) {
  return apiClient<MentorshipItem>('/mentorship/requests', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function clarifyMentorshipRequest(
  accessToken: string | null,
  id: string,
  question: string,
) {
  return apiClient<MentorshipItem>(`/mentorship/requests/${id}/clarify`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ question }),
  });
}

export function replyMentorshipClarification(
  accessToken: string | null,
  id: string,
  reply: string,
) {
  return apiClient<MentorshipItem>(`/mentorship/requests/${id}/clarify-reply`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ reply }),
  });
}

export function acceptMentorshipRequest(accessToken: string | null, id: string) {
  return apiClient<MentorshipItem>(`/mentorship/requests/${id}/accept`, {
    method: 'PATCH',
    accessToken,
  });
}

export function rejectMentorshipRequest(
  accessToken: string | null,
  id: string,
  reason?: string,
) {
  return apiClient<MentorshipItem>(`/mentorship/requests/${id}/reject`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ reason }),
  });
}

export function cancelMentorshipRequest(
  accessToken: string | null,
  id: string,
  note?: string,
) {
  return apiClient<MentorshipItem>(`/mentorship/${id}/cancel`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ note }),
  });
}

export function endMentorship(
  accessToken: string | null,
  id: string,
  note?: string,
) {
  return apiClient<MentorshipItem>(`/mentorship/${id}/end`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ note }),
  });
}

export function updateMentorshipNote(
  accessToken: string | null,
  id: string,
  input: { note: string; scheduledAt?: string | null },
) {
  return apiClient<MentorshipItem>(`/mentorship/${id}/note`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function updateMentorshipAvailability(
  accessToken: string | null,
  input: {
    status: 'OPEN' | 'CLOSED';
    maxActiveMentees?: number;
    topics?: string[];
  },
) {
  return apiClient<{
    id: string;
    isMentorshipAvailable: boolean;
    mentorshipStatus: string;
    maxActiveMentees: number;
    mentorshipTopics: string[];
  }>('/mentorship/availability', {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(input),
  });
}

export function getAdminMentorshipStats(accessToken: string | null) {
  return apiClient<MentorshipStats>('/admin/mentorship/stats', { accessToken });
}
