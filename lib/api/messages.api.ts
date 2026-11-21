import { apiClient } from './client';
import { uploadMediaFile } from './media.api';
import type {
  ConversationDto,
  MessageAttachment,
  MessageDto,
  MessagingEligibility,
} from '@/types/domain';

export interface ConversationsListResponse {
  conversations: ConversationDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessagesListResponse {
  messages: MessageDto[];
  nextCursor: string | null;
}

export const messagesApi = {
  checkEligibility(targetUserId: string) {
    return apiClient<MessagingEligibility>(`/messages/eligibility/${encodeURIComponent(targetUserId)}`);
  },

  startOrGetConversation(input: {
    targetUserId: string;
    initialMessage?: string;
    contextType?: string;
    contextId?: string;
  }) {
    return apiClient<ConversationDto>('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  getConversations(params: {
    tab?: 'all' | 'unread' | 'archived';
    q?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.tab) query.set('tab', params.tab);
    if (params.q) query.set('q', params.q);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return apiClient<ConversationsListResponse>(`/messages/conversations${qs ? `?${qs}` : ''}`);
  },

  getConversation(id: string) {
    return apiClient<ConversationDto>(`/messages/conversations/${encodeURIComponent(id)}`);
  },

  getMessages(id: string, params: { cursor?: string; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.cursor) query.set('cursor', params.cursor);
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return apiClient<MessagesListResponse>(`/messages/conversations/${encodeURIComponent(id)}/messages${qs ? `?${qs}` : ''}`);
  },

  sendMessage(
    conversationId: string,
    payload: {
      content?: string;
      type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'SYSTEM';
      attachments?: MessageAttachment[];
      replyToId?: string;
    },
  ) {
    return apiClient<MessageDto>(`/messages/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  editMessage(messageId: string, content: string) {
    return apiClient<MessageDto>(`/messages/messages/${encodeURIComponent(messageId)}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  deleteMessage(messageId: string, mode: 'ME' | 'EVERYONE') {
    return apiClient<{ success: boolean; mode: string }>(
      `/messages/messages/${encodeURIComponent(messageId)}?mode=${mode}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ mode }),
      },
    );
  },

  toggleReaction(messageId: string, emoji: string) {
    return apiClient<{ reactions: Record<string, string[]> }>(
      `/messages/messages/${encodeURIComponent(messageId)}/react`,
      {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      },
    );
  },

  markConversationRead(conversationId: string) {
    return apiClient<{ success: boolean }>(
      `/messages/conversations/${encodeURIComponent(conversationId)}/read`,
      {
        method: 'POST',
      },
    );
  },

  updatePreferences(
    conversationId: string,
    preferences: {
      isArchived?: boolean;
      isMuted?: boolean;
      isPinned?: boolean;
    },
  ) {
    return apiClient<unknown>(
      `/messages/conversations/${encodeURIComponent(conversationId)}/preferences`,
      {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      },
    );
  },

  getUnreadCount() {
    return apiClient<{ unreadCount: number }>('/messages/unread-count');
  },

  async uploadAttachment(accessToken: string | null, file: File): Promise<MessageAttachment> {
    const res = await uploadMediaFile(accessToken, file, 'MESSAGE_ATTACHMENT');
    const data = res.data;
    if (!data) {
      throw new Error('Failed to upload attachment');
    }

    return {
      url: data.url,
      secureUrl: data.secureUrl,
      publicId: data.publicId,
      fileName: file.name,
      fileSize: data.sizeBytes,
      mimeType: file.type,
    };
  },
};
