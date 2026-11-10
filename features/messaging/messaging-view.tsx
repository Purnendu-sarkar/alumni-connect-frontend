'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Users,
} from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import {
  demoConversations,
  demoMessages,
  type ConversationRecord,
  type MessageRecord,
} from '@/features/shared/demo-data';
import type { UserRole } from '@/types/domain';

interface MessagingViewProps {
  currentRole: UserRole;
  basePath: string;
  initialUserId?: string;
}

export function MessagingView({ currentRole, basePath, initialUserId }: MessagingViewProps) {
  const [conversations, setConversations] = useState<ConversationRecord[]>(demoConversations);
  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || 'conv-1');
  const [messages, setMessages] = useState<Record<string, MessageRecord[]>>(demoMessages);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const currentMessages = messages[activeConvId] || [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const newMsg: MessageRecord = {
      id: `msg-${Date.now()}`,
      conversationId: activeConv.id,
      senderId: 'current-user',
      senderName: 'You',
      text: inputText.trim(),
      createdAt: 'Just now',
      isMine: true,
    };

    setMessages((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? { ...c, lastMessage: inputText.trim(), lastMessageAt: 'Just now' }
          : c
      )
    );

    setInputText('');
  };

  const filteredConversations = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(search.toLowerCase()) ||
    c.participantCompany.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CAMPUS MESSAGING"
        title="Direct Conversations"
        description="Private messaging with verified classmates, mentors, and departmental alumni."
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[600px]">
        {/* Left: Conversations List */}
        <div className="border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((c) => {
              const isActive = c.id === activeConvId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors ${
                    isActive ? 'bg-blue-50/80 border-l-3 border-blue-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <Avatar name={c.participantName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate m-0">
                        {c.participantName}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{c.lastMessageAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate m-0 mt-0.5">
                      {c.participantRole} · {c.participantCompany}
                    </p>
                    <p className="text-xs text-slate-600 truncate m-0 mt-1">
                      {c.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Message Thread */}
        <div className="md:col-span-2 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <Avatar name={activeConv.participantName} />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 m-0">
                      {activeConv.participantName}
                    </h3>
                    <p className="text-xs text-slate-500 m-0">
                      {activeConv.participantRole} at {activeConv.participantCompany}
                    </p>
                  </div>
                </div>

                <Button size="sm" variant="ghost" asChild>
                  <Link href={`${basePath}/directory/${activeConv.participantId}`}>
                    View Profile
                  </Link>
                </Button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentMessages.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 mt-10">
                    No messages yet. Say hello to start the conversation!
                  </p>
                ) : (
                  currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.isMine
                            ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {msg.createdAt}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Reply to ${activeConv.participantName}…`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <Button type="submit" size="sm" disabled={!inputText.trim()}>
                  <Send size={14} /> Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Select a conversation to read messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
