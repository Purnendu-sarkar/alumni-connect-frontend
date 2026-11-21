'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Loader2,
  Paperclip,
  Send,
  Smile,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { messagesApi } from '@/lib/api/messages.api';
import type { MessageAttachment, MessageDto, MessagingEligibility } from '@/types/domain';

interface MessageComposerProps {
  conversationId: string;
  eligibility?: MessagingEligibility | null;
  replyingTo?: MessageDto | null;
  editingMessage?: MessageDto | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  onSendMessage: (payload: {
    content: string;
    type?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO';
    attachments?: MessageAttachment[];
    replyToId?: string;
  }) => Promise<void>;
  onSaveEdit?: (messageId: string, newContent: string) => Promise<void>;
  onStartTyping?: (conversationId: string) => void;
  onStopTyping?: (conversationId: string) => void;
}

const EMOJI_PALETTE = ['😀', '😂', '😍', '👍', '🎉', '🔥', '🙏', '💯', '✨', '👏', '🤝', '🎓', '💼', '🚀'];

export function MessageComposer({
  conversationId,
  eligibility,
  replyingTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  onSendMessage,
  onSaveEdit,
  onStartTyping,
  onStopTyping,
}: MessageComposerProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Sync text if editing
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content || '');
      textareaRef.current?.focus();
    } else {
      setText('');
    }
  }, [editingMessage]);

  // Auto-grow textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustTextareaHeight();
    if (onStartTyping) {
      onStartTyping(conversationId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10 MB limit');
      return;
    }

    try {
      setIsUploading(true);
      const uploaded = await messagesApi.uploadAttachment(accessToken, file);
      setAttachments((prev) => [...prev, uploaded]);
    } catch {
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInsertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    if (isSubmitting || isUploading) return;

    try {
      setIsSubmitting(true);
      if (onStopTyping) {
        onStopTyping(conversationId);
      }

      if (editingMessage && onSaveEdit) {
        await onSaveEdit(editingMessage.id, trimmed);
        setText('');
      } else {
        let type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' = 'TEXT';
        if (attachments.length > 0) {
          const first = attachments[0];
          if (first?.mimeType.startsWith('image/')) type = 'IMAGE';
          else if (first?.mimeType.startsWith('audio/')) type = 'AUDIO';
          else type = 'FILE';
        }

        await onSendMessage({
          content: trimmed,
          type,
          attachments,
          replyToId: replyingTo?.id,
        });

        setText('');
        setAttachments([]);
      }

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is restricted from messaging
  if (eligibility && !eligibility.eligible) {
    return (
      <div className="p-3 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs flex items-center justify-center text-center">
        <span>{eligibility.message || 'Direct messaging is currently restricted.'}</span>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 bg-white p-2.5 sm:p-3 relative">
      {/* Quoted reply banner */}
      {replyingTo && !editingMessage && (
        <div className="flex items-center justify-between bg-slate-50 border-l-4 border-blue-600 px-3 py-1.5 rounded text-xs mb-2 text-slate-700">
          <div className="truncate">
            <span className="font-semibold block text-[11px] text-blue-700">
              Replying to {replyingTo.senderName}
            </span>
            <span className="truncate block opacity-80">{replyingTo.content}</span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editing banner */}
      {editingMessage && (
        <div className="flex items-center justify-between bg-blue-50 border-l-4 border-blue-500 px-3 py-1.5 rounded text-xs mb-2 text-blue-800">
          <span className="font-semibold text-[11px]">Editing message</span>
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-1 text-blue-400 hover:text-blue-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-700"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate max-w-[150px]">{att.fileName}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="text-slate-400 hover:text-slate-600 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji Picker popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 left-4 bg-white border border-slate-200 p-2 rounded-xl shadow-xl z-20 grid grid-cols-7 gap-1">
          {EMOJI_PALETTE.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleInsertEmoji(emoji)}
              className="p-1.5 hover:bg-slate-100 rounded text-lg hover:scale-110 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Composer Input Bar */}
      <div className="flex items-end gap-1.5 sm:gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,audio/*"
        />

        {/* Attachment button */}
        {!editingMessage && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors shrink-0 disabled:opacity-50"
            title="Attach file"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Emoji palette toggle */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          title="Insert emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Expanding textarea */}
        <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={editingMessage ? 'Update message...' : 'Type a message...'}
            className="w-full resize-none border-0 bg-transparent p-0 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 max-h-32"
          />
        </div>

        {/* Send Button */}
        <Button
          type="button"
          size="sm"
          disabled={(!text.trim() && attachments.length === 0) || isSubmitting || isUploading}
          onClick={() => void handleSubmit()}
          className="rounded-full w-9 h-9 p-0 shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-40"
          title={editingMessage ? 'Save changes' : 'Send'}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 ml-0.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
