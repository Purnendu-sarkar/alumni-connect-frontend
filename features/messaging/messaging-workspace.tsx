'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, MessagesSquare, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { messagesApi } from '@/lib/api/messages.api';
import { useMessagingSocket } from './use-messaging-socket';
import { ConversationSidebar } from './conversation-sidebar';
import { ActiveChatThread } from './active-chat-thread';
import { NewChatModal } from './new-chat-modal';
import { ReportContentModal } from '@/components/shared/report-content-modal';
import type { ConversationDto, MessageAttachment, MessageDto, UserRole } from '@/types/domain';

interface MessagingWorkspaceProps {
  currentRole: UserRole;
  basePath: string;
  initialUserId?: string;
}

export function MessagingWorkspace({
  currentRole,
  basePath,
  initialUserId,
}: MessagingWorkspaceProps) {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?.id) || '';

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [reportingUser, setReportingUser] = useState<{ id: string; name: string } | null>(null);

  // Debounce search query 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Connect socket
  const {
    isUserOnline,
    typingUserInActiveChat,
    startTyping,
    stopTyping,
    checkUsersPresence,
  } = useMessagingSocket(activeConvId);

  // Query: Conversations list
  const { data: convsData, isLoading: isLoadingConvs } = useQuery({
    queryKey: ['conversations', currentTab, debouncedSearch],
    queryFn: async () => {
      const res = await messagesApi.getConversations({
        tab: currentTab,
        q: debouncedSearch || undefined,
      });
      return res.data?.conversations || [];
    },
    refetchInterval: 30000,
  });

  const conversations: ConversationDto[] = useMemo(() => convsData || [], [convsData]);

  // Check presence for other participants whenever conversation list changes
  useEffect(() => {
    if (conversations.length > 0) {
      const otherUserIds = conversations.map((c) => c.otherParticipant.id).filter(Boolean);
      checkUsersPresence(otherUserIds);
    }
  }, [conversations, checkUsersPresence]);

  const initializingUserIdRef = useRef<string | null>(null);

  // Deep-linking: if initialUserId is present, find or create conversation
  useEffect(() => {
    if (!initialUserId || initialUserId === currentUserId) return;

    // Fast-path: Check if conversation already exists in current loaded list
    const existing = conversations.find((c) => c.otherParticipant.id === initialUserId);
    if (existing) {
      setActiveConvId(existing.id);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('user');
        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
      }
      return;
    }

    // Deduplication guard for React 19 StrictMode / concurrent renders
    if (initializingUserIdRef.current === initialUserId) return;
    initializingUserIdRef.current = initialUserId;

    let isMounted = true;
    void (async () => {
      try {
        const res = await messagesApi.startOrGetConversation({ targetUserId: initialUserId });
        if (isMounted && res.data?.id) {
          setActiveConvId(res.data.id);
          void queryClient.invalidateQueries({ queryKey: ['conversations'] });

          // Clear ?user query parameter from URL so page refresh won't snap back to initial user
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('user');
            window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
          }
        }
      } catch (err: unknown) {
        // Fallback: Invalidate conversations to sync client state
        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
        console.warn('Notice when initializing conversation with deep-linked user:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [initialUserId, currentUserId, queryClient, conversations]);

  // Auto-select first conversation on desktop if none selected and not deep-linked
  useEffect(() => {
    if (!activeConvId && !initialUserId && conversations.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setActiveConvId(conversations[0]?.id || null);
    }
  }, [conversations, activeConvId, initialUserId]);

  // Active conversation record
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConvId) || null,
    [conversations, activeConvId],
  );

  // Query: Active conversation messages
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: async () => {
      if (!activeConvId) return { messages: [], nextCursor: null };
      const res = await messagesApi.getMessages(activeConvId, { limit: 50 });
      return res.data || { messages: [], nextCursor: null };
    },
    enabled: !!activeConvId,
  });

  const messages: MessageDto[] = useMemo(() => messagesData?.messages || [], [messagesData]);

  // Query: Recipient Messaging Eligibility
  const otherUserId = activeConversation?.otherParticipant?.id;
  const { data: eligibility } = useQuery({
    queryKey: ['eligibility', otherUserId],
    queryFn: async () => {
      if (!otherUserId) return null;
      const res = await messagesApi.checkEligibility(otherUserId);
      return res.data || null;
    },
    enabled: !!otherUserId,
  });

  // Mark conversation read when opened with unread messages
  useEffect(() => {
    if (!activeConvId || !activeConversation) return;

    if (activeConversation.preferences.unreadCount > 0) {
      void messagesApi.markConversationRead(activeConvId).then(() => {
        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
        void queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
      });
    }
  }, [activeConvId, activeConversation, queryClient]);

  // Send message mutation
  const handleSendMessage = async (payload: {
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO';
    attachments?: MessageAttachment[];
    replyToId?: string;
  }) => {
    if (!activeConvId) return;
    await messagesApi.sendMessage(activeConvId, payload);
    void queryClient.invalidateQueries({ queryKey: ['messages', activeConvId] });
    void queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  // Edit message mutation
  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!activeConvId) return;
    await messagesApi.editMessage(messageId, newContent);
    void queryClient.invalidateQueries({ queryKey: ['messages', activeConvId] });
  };

  // Delete message for me
  const handleDeleteMessageForMe = async (messageId: string) => {
    if (!activeConvId) return;
    await messagesApi.deleteMessage(messageId, 'ME');
    void queryClient.invalidateQueries({ queryKey: ['messages', activeConvId] });
  };

  // Delete message for everyone
  const handleDeleteMessageForEveryone = async (messageId: string) => {
    if (!activeConvId) return;
    await messagesApi.deleteMessage(messageId, 'EVERYONE');
    void queryClient.invalidateQueries({ queryKey: ['messages', activeConvId] });
  };

  // Toggle emoji reaction
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!activeConvId) return;
    await messagesApi.toggleReaction(messageId, emoji);
    void queryClient.invalidateQueries({ queryKey: ['messages', activeConvId] });
  };

  // Update participant preferences (Pin, Mute, Archive)
  const handleUpdatePreferences = async (
    conversationId: string,
    preferences: { isArchived?: boolean; isMuted?: boolean; isPinned?: boolean },
  ) => {
    await messagesApi.updatePreferences(conversationId, preferences);
    void queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  const isOtherOnline = otherUserId ? isUserOnline(otherUserId) : false;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Sidebar: Visible on desktop, or on mobile when no conversation is selected */}
      <div
        className={`${
          activeConvId ? 'hidden md:flex' : 'flex'
        } w-full md:w-auto h-full flex-col shrink-0`}
      >
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConvId}
          currentTab={currentTab}
          searchQuery={searchQuery}
          isOnline={isUserOnline}
          typingMap={
            activeConvId && typingUserInActiveChat
              ? { [activeConvId]: typingUserInActiveChat }
              : {}
          }
          onSelectConversation={(id) => setActiveConvId(id)}
          onTabChange={(tab) => setCurrentTab(tab)}
          onSearchChange={(q) => setSearchQuery(q)}
          onOpenNewChat={() => setIsNewChatModalOpen(true)}
          onUpdatePreferences={handleUpdatePreferences}
        />
      </div>

      {/* Main Thread: Visible on desktop, or on mobile when conversation is selected */}
      <main
        className={`${
          activeConvId ? 'flex' : 'hidden md:flex'
        } flex-1 h-full flex-col min-w-0`}
      >
        {activeConversation ? (
          <ActiveChatThread
            conversation={activeConversation}
            messages={messages}
            currentUserId={currentUserId}
            basePath={basePath}
            isOnline={isOtherOnline}
            isTyping={!!typingUserInActiveChat}
            typingUserName={typingUserInActiveChat}
            eligibility={eligibility}
            isLoadingMessages={isLoadingMessages}
            hasMoreMessages={Boolean(messagesData?.nextCursor)}
            onLoadMore={() => {
              /* Cursor pagination trigger */
            }}
            onBackToList={() => setActiveConvId(null)}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessageForMe={handleDeleteMessageForMe}
            onDeleteMessageForEveryone={handleDeleteMessageForEveryone}
            onToggleReaction={handleToggleReaction}
            onStartTyping={startTyping}
            onStopTyping={stopTyping}
            onReportUser={(userId) => {
              const other = activeConversation?.otherParticipant;
              setReportingUser({ id: userId, name: other?.name || 'Member' });
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
              <MessagesSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Select a conversation
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              Choose an existing chat thread or start a new conversation with fellow students and alumni.
            </p>
            <button
              type="button"
              onClick={() => setIsNewChatModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Start new chat</span>
            </button>
          </div>
        )}
      </main>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onConversationCreated={(newConvId) => {
          setActiveConvId(newConvId);
          void queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }}
      />

      {/* Report Member Modal */}
      {reportingUser && (
        <ReportContentModal
          isOpen={Boolean(reportingUser)}
          onClose={() => setReportingUser(null)}
          targetType="USER"
          targetId={reportingUser.id}
          targetName={reportingUser.name}
        />
      )}
    </div>
  );
}
