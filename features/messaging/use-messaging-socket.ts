'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, connectSocket } from '@/lib/socket/socket-client';
import { useAuthStore } from '@/store/auth-store';
import type { MessageDto } from '@/types/domain';

interface TypingStatusPayload {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export function useMessagingSocket(activeConversationId?: string | null) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentUser = useAuthStore((s) => s.user);

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket(accessToken);

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onPresenceUpdate = (data: { userId: string; status: 'ONLINE' | 'OFFLINE' }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.status === 'ONLINE') {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    const onMessageNew = (data: { conversationId: string; message: MessageDto }) => {
      // Invalidate message list for the conversation
      void queryClient.invalidateQueries({
        queryKey: ['messages', data.conversationId],
      });
      // Invalidate conversations list & unread count
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      void queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    };

    const onConversationUpdated = (data: { conversationId: string }) => {
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const onMessageRead = (data: { conversationId: string; readerId: string }) => {
      void queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const onMessageDelivered = (data: { conversationId: string; messageId: string }) => {
      void queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
    };

    const onMessageUpdated = (data: { conversationId: string; message: MessageDto }) => {
      void queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const onMessageDeletedForAll = (data: { conversationId: string; messageId: string }) => {
      void queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const onReactionUpdated = (data: { conversationId: string }) => {
      void queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
    };

    const onTypingStatus = (data: TypingStatusPayload) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (data.isTyping) {
          next[data.conversationId] = data.userName;
        } else {
          delete next[data.conversationId];
        }
        return next;
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('presence:update', onPresenceUpdate);
    socket.on('message:new', onMessageNew);
    socket.on('conversation:updated', onConversationUpdated);
    socket.on('message:read', onMessageRead);
    socket.on('message:delivered', onMessageDelivered);
    socket.on('message:updated', onMessageUpdated);
    socket.on('message:deleted_for_all', onMessageDeletedForAll);
    socket.on('message:reaction_updated', onReactionUpdated);
    socket.on('typing:status', onTypingStatus);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('presence:update', onPresenceUpdate);
      socket.off('message:new', onMessageNew);
      socket.off('conversation:updated', onConversationUpdated);
      socket.off('message:read', onMessageRead);
      socket.off('message:delivered', onMessageDelivered);
      socket.off('message:updated', onMessageUpdated);
      socket.off('message:deleted_for_all', onMessageDeletedForAll);
      socket.off('message:reaction_updated', onReactionUpdated);
      socket.off('typing:status', onTypingStatus);
    };
  }, [accessToken, queryClient]);

  // Join active conversation room
  useEffect(() => {
    if (!activeConversationId) return;
    const socket = getSocket();
    socket.emit('conversation:join', { conversationId: activeConversationId });

    return () => {
      socket.emit('conversation:leave', { conversationId: activeConversationId });
    };
  }, [activeConversationId]);

  const startTyping = useCallback(
    (conversationId: string) => {
      const socket = getSocket();
      socket.emit('typing:start', { conversationId });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId });
      }, 2500);
    },
    [],
  );

  const stopTyping = useCallback(
    (conversationId: string) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      const socket = getSocket();
      socket.emit('typing:stop', { conversationId });
    },
    [],
  );

  const checkUsersPresence = useCallback((userIds: string[]) => {
    const socket = getSocket();
    if (!socket.connected) return;

    socket.emit('presence:check', { userIds }, (statusMap: Record<string, boolean>) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        for (const [id, isOnline] of Object.entries(statusMap)) {
          if (isOnline) next.add(id);
          else next.delete(id);
        }
        return next;
      });
    });
  }, []);

  return {
    isConnected,
    onlineUsers,
    isUserOnline: (userId: string) => onlineUsers.has(userId),
    typingUserInActiveChat: activeConversationId ? typingUsers[activeConversationId] : null,
    startTyping,
    stopTyping,
    checkUsersPresence,
  };
}
