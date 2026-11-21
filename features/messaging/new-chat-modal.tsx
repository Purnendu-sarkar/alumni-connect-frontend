'use client';

import { useState, useEffect } from 'react';
import { Loader2, MessageSquare, Search, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { searchDirectory, type DirectoryMemberCard } from '@/lib/api/directory.api';
import { messagesApi } from '@/lib/api/messages.api';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export function NewChatModal({
  isOpen,
  onClose,
  onConversationCreated,
}: NewChatModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<DirectoryMemberCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setMembers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await searchDirectory(accessToken, {
          q: search.trim() || undefined,
          limit: 15,
        });
        const list = (res.data || []).filter((m) => m.id !== currentUserId);
        setMembers(list);
      } catch {
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, search, accessToken, currentUserId]);

  const handleStartChat = async (targetUserId: string) => {
    try {
      setIsStarting(targetUserId);
      const res = await messagesApi.startOrGetConversation({ targetUserId });
      if (res.data?.id) {
        onConversationCreated(res.data.id);
        onClose();
      }
    } catch (err: any) {
      alert(err.message || 'Cannot start conversation with this member.');
    } finally {
      setIsStarting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-slate-900">
            Start New Conversation
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, department, or company..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Member Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-xs">Searching members...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center p-8 text-slate-400 text-xs">
              No members found. Try another search term.
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    name={member.name || 'User'}
                    src={member.avatarUrl || undefined}
                    className="w-9 h-9 text-xs"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {member.name}
                      </span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1 font-medium border-slate-200">
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {member.department || 'NWU Member'}
                      {member.currentCompany ? ` • ${member.currentCompany}` : ''}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isStarting === member.id}
                  onClick={() => handleStartChat(member.id)}
                  className="text-xs shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {isStarting === member.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      <span>Chat</span>
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
