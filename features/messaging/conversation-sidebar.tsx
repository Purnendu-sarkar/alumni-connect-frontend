'use client';

import { useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  BellOff,
  BellRing,
  MoreVertical,
  Pin,
  PinOff,
  Plus,
  Search,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ConversationDto } from '@/types/domain';

interface ConversationSidebarProps {
  conversations: ConversationDto[];
  activeConversationId?: string | null;
  currentTab: 'all' | 'unread' | 'archived';
  searchQuery: string;
  isOnline: (userId: string) => boolean;
  typingMap?: Record<string, string>;
  onSelectConversation: (conversationId: string) => void;
  onTabChange: (tab: 'all' | 'unread' | 'archived') => void;
  onSearchChange: (q: string) => void;
  onOpenNewChat: () => void;
  onUpdatePreferences: (
    conversationId: string,
    preferences: { isArchived?: boolean; isMuted?: boolean; isPinned?: boolean },
  ) => void;
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  currentTab,
  searchQuery,
  isOnline,
  typingMap = {},
  onSelectConversation,
  onTabChange,
  onSearchChange,
  onOpenNewChat,
  onUpdatePreferences,
}: ConversationSidebarProps) {
  const formatLastMessageTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 bg-white h-full select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Messages</h2>
          <p className="text-xs text-slate-500">Real-time campus communications</p>
        </div>
        <Button
          size="sm"
          onClick={onOpenNewChat}
          className="rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          title="New conversation"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages or people..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-3 pt-2 gap-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => onTabChange('all')}
          className={`pb-2 px-2 border-b-2 transition-colors ${
            currentTab === 'all'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => onTabChange('unread')}
          className={`pb-2 px-2 border-b-2 transition-colors ${
            currentTab === 'unread'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Unread
        </button>
        <button
          type="button"
          onClick={() => onTabChange('archived')}
          className={`pb-2 px-2 border-b-2 transition-colors ${
            currentTab === 'archived'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Archived
        </button>
      </div>

      {/* Conversation Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <p>No conversations in this view.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenNewChat}
              className="mt-3 text-xs"
            >
              Start a new chat
            </Button>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const other = conv.otherParticipant;
            const online = isOnline(other.id);
            const isTyping = typingMap[conv.id];
            const hasUnread = conv.preferences.unreadCount > 0;

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-blue-50/70 border-l-4 border-blue-600'
                    : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                }`}
              >
                {/* Avatar with Presence Indicator */}
                <div className="relative shrink-0">
                  <Avatar
                    name={other.name || 'User'}
                    src={other.avatarUrl || undefined}
                    className="w-10 h-10 text-xs font-semibold"
                  />
                  {online && (
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
                      title="Online"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-xs truncate ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {other.name}
                      </span>
                      {conv.preferences.isPinned && (
                        <Pin className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500" />
                      )}
                      {conv.preferences.isMuted && (
                        <BellOff className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                      {formatLastMessageTime(conv.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-slate-500 truncate min-w-0">
                      {isTyping ? (
                        <span className="text-emerald-600 italic font-medium">
                          typing...
                        </span>
                      ) : (
                        conv.lastMessageSnippet || 'No messages yet'
                      )}
                    </p>

                    {/* Unread badge */}
                    {hasUnread && (
                      <span className="shrink-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                        {conv.preferences.unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover Action Menu */}
                <div
                  className="hidden group-hover:block absolute right-2 top-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="p-1 text-slate-400 hover:text-slate-700 bg-white/80 rounded-full shadow-sm hover:bg-white"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs w-36">
                      <DropdownMenuItem
                        onClick={() =>
                          onUpdatePreferences(conv.id, {
                            isPinned: !conv.preferences.isPinned,
                          })
                        }
                        className="gap-2 cursor-pointer"
                      >
                        {conv.preferences.isPinned ? (
                          <>
                            <PinOff className="w-3.5 h-3.5" />
                            <span>Unpin chat</span>
                          </>
                        ) : (
                          <>
                            <Pin className="w-3.5 h-3.5" />
                            <span>Pin chat</span>
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          onUpdatePreferences(conv.id, {
                            isMuted: !conv.preferences.isMuted,
                          })
                        }
                        className="gap-2 cursor-pointer"
                      >
                        {conv.preferences.isMuted ? (
                          <>
                            <BellRing className="w-3.5 h-3.5" />
                            <span>Unmute</span>
                          </>
                        ) : (
                          <>
                            <BellOff className="w-3.5 h-3.5" />
                            <span>Mute</span>
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          onUpdatePreferences(conv.id, {
                            isArchived: !conv.preferences.isArchived,
                          })
                        }
                        className="gap-2 cursor-pointer"
                      >
                        {conv.preferences.isArchived ? (
                          <>
                            <ArchiveRestore className="w-3.5 h-3.5" />
                            <span>Unarchive</span>
                          </>
                        ) : (
                          <>
                            <Archive className="w-3.5 h-3.5" />
                            <span>Archive</span>
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
