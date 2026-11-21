'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowLeft,
  Ban,
  Flag,
  Loader2,
  MoreVertical,
  ShieldAlert,
  User,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageBubble } from './message-bubble';
import { MessageComposer } from './message-composer';
import type {
  ConversationDto,
  MessageDto,
  MessagingEligibility,
} from '@/types/domain';

interface ActiveChatThreadProps {
  conversation: ConversationDto;
  messages: MessageDto[];
  currentUserId: string;
  basePath: string;
  isOnline: boolean;
  isTyping: boolean;
  typingUserName?: string | null;
  eligibility?: MessagingEligibility | null;
  isLoadingMessages?: boolean;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
  onBackToList?: () => void;
  onSendMessage: (payload: {
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO';
    attachments?: any[];
    replyToId?: string;
  }) => Promise<void>;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onDeleteMessageForMe: (messageId: string) => void;
  onDeleteMessageForEveryone: (messageId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onStartTyping: (convId: string) => void;
  onStopTyping: (convId: string) => void;
  onBlockUser?: (targetUserId: string) => void;
  onReportUser?: (targetUserId: string) => void;
}

export function ActiveChatThread({
  conversation,
  messages,
  currentUserId,
  basePath,
  isOnline,
  isTyping,
  typingUserName,
  eligibility,
  isLoadingMessages,
  hasMoreMessages,
  onLoadMore,
  onBackToList,
  onSendMessage,
  onEditMessage,
  onDeleteMessageForMe,
  onDeleteMessageForEveryone,
  onToggleReaction,
  onStartTyping,
  onStopTyping,
  onBlockUser,
  onReportUser,
}: ActiveChatThreadProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [replyingTo, setReplyingTo] = useState<MessageDto | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageDto | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const other = conversation.otherParticipant;

  // Auto-scroll to bottom when messages load or change
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [conversation.id]);

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(true);
    }
  }, [messages.length]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 150);
  };

  // Group messages by Date
  const getDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden select-none">
      {/* Sticky Header */}
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back button */}
          <button
            type="button"
            onClick={onBackToList}
            className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100"
            title="Back to messages"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar with Presence Indicator */}
          <div className="relative shrink-0">
            <Avatar
              name={other.name || 'User'}
              src={other.avatarUrl || undefined}
              className="w-10 h-10 text-xs font-semibold"
            />
            {isOnline && (
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
                title="Online"
              />
            )}
          </div>

          {/* User Details & Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 truncate">
                {other.name}
              </span>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium border-slate-200">
                {other.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {isTyping ? (
                <span className="text-emerald-600 font-semibold italic">
                  typing...
                </span>
              ) : isOnline ? (
                <span className="text-emerald-600 font-medium">Online</span>
              ) : other.department ? (
                `${other.department}${other.currentCompany ? ` • ${other.currentCompany}` : ''}`
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        {/* Header Options Menu */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`${basePath}/directory/${other.id}`}
            className="hidden sm:inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem asChild>
                <Link
                  href={`${basePath}/directory/${other.id}`}
                  className="gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>View full profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {onBlockUser && (
                <DropdownMenuItem
                  onClick={() => onBlockUser(other.id)}
                  className="gap-2 cursor-pointer text-amber-700 focus:text-amber-700"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Block member</span>
                </DropdownMenuItem>
              )}

              {onReportUser && (
                <DropdownMenuItem
                  onClick={() => onReportUser(other.id)}
                  className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report member</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Message Stream Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 relative"
      >
        {/* Load Earlier Messages Button */}
        {hasMoreMessages && (
          <div className="text-center py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoadingMessages}
              className="text-xs bg-white text-slate-600 hover:bg-slate-50 shadow-xs"
            >
              {isLoadingMessages ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>Loading older messages...</span>
                </>
              ) : (
                <span>Load earlier messages</span>
              )}
            </Button>
          </div>
        )}

        {/* Message stream */}
        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const showDateDivider =
            !prevMsg ||
            new Date(prevMsg.createdAt).toDateString() !==
              new Date(msg.createdAt).toDateString();

          return (
            <div key={msg.id}>
              {/* Date divider chip */}
              {showDateDivider && (
                <div className="flex justify-center my-3">
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full shadow-2xs">
                    {getDateLabel(msg.createdAt)}
                  </span>
                </div>
              )}

              <MessageBubble
                message={msg}
                currentUserId={currentUserId}
                onReply={(m) => {
                  setReplyingTo(m);
                  setEditingMessage(null);
                }}
                onEdit={(m) => {
                  setEditingMessage(m);
                  setReplyingTo(null);
                }}
                onDeleteForMe={onDeleteMessageForMe}
                onDeleteForEveryone={onDeleteMessageForEveryone}
                onToggleReaction={onToggleReaction}
              />
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="flex items-center gap-2 my-1.5 justify-start">
            <Avatar
              name={other.name || 'User'}
              src={other.avatarUrl || undefined}
              className="w-7 h-7 shrink-0 text-xs"
            />
            <div className="bg-slate-200/80 text-slate-600 px-3 py-1.5 rounded-2xl rounded-bl-xs text-xs flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute right-6 bottom-20 z-20 p-2.5 bg-white border border-slate-200 rounded-full shadow-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all hover:scale-105"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Composer */}
      <MessageComposer
        conversationId={conversation.id}
        eligibility={eligibility}
        replyingTo={replyingTo}
        editingMessage={editingMessage}
        onCancelReply={() => setReplyingTo(null)}
        onCancelEdit={() => setEditingMessage(null)}
        onSendMessage={onSendMessage}
        onSaveEdit={onEditMessage}
        onStartTyping={onStartTyping}
        onStopTyping={onStopTyping}
      />
    </div>
  );
}
