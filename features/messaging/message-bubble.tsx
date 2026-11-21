'use client';

import { useState } from 'react';
import {
  Check,
  CheckCheck,
  Copy,
  CornerUpLeft,
  Download,
  FileText,
  MoreVertical,
  Pencil,
  Smile,
  Trash2,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { MessageAttachment, MessageDto } from '@/types/domain';

interface MessageBubbleProps {
  message: MessageDto;
  currentUserId: string;
  onReply?: (message: MessageDto) => void;
  onEdit?: (message: MessageDto) => void;
  onDeleteForMe?: (messageId: string) => void;
  onDeleteForEveryone?: (messageId: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

export function MessageBubble({
  message,
  currentUserId,
  onReply,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onToggleReaction,
}: MessageBubbleProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isOwn = message.isOwn || message.senderId === currentUserId;
  const isDeleted = message.isDeletedForAll;

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate if edit is allowed (within 15 minutes)
  const canEdit =
    isOwn &&
    !isDeleted &&
    Date.now() - new Date(message.createdAt).getTime() <= 15 * 60 * 1000;

  const handleCopyText = () => {
    if (message.content) {
      void navigator.clipboard.writeText(message.content);
    }
  };

  const renderDeliveryTick = () => {
    if (!isOwn || isDeleted) return null;
    switch (message.deliveryStatus) {
      case 'READ':
        return (
          <span title="Read">
            <CheckCheck className="w-3.5 h-3.5 text-cyan-300 stroke-[2.5]" />
          </span>
        );
      case 'DELIVERED':
        return (
          <span title="Delivered">
            <CheckCheck className="w-3.5 h-3.5 text-blue-200 stroke-[2]" />
          </span>
        );
      case 'SENT':
      default:
        return (
          <span title="Sent">
            <Check className="w-3.5 h-3.5 text-blue-200 stroke-[2]" />
          </span>
        );
    }
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={`group relative flex items-end gap-2 my-1.5 transition-colors ${
        isOwn ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Avatar for incoming messages */}
      {!isOwn && (
        <Avatar
          name={message.senderName || 'User'}
          src={message.senderAvatarUrl || undefined}
          className="w-7 h-7 mb-1 shrink-0 text-xs"
        />
      )}

      {/* Main bubble container */}
      <div className={`relative max-w-[85%] sm:max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name for incoming in group context */}
        {!isOwn && (
          <span className="text-[11px] font-medium text-slate-500 mb-0.5 ml-1">
            {message.senderName}
          </span>
        )}

        {/* Quoted reply banner */}
        {message.replyTo && !isDeleted && (
          <div
            className={`text-xs px-3 py-1.5 rounded-t-lg border-l-4 mb-0.5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer ${
              isOwn
                ? 'bg-blue-700/60 border-cyan-300 text-blue-100'
                : 'bg-slate-200/80 border-blue-600 text-slate-700'
            }`}
            onClick={() => {
              const el = document.getElementById(`msg-${message.replyTo?.id}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          >
            <span className="font-semibold block text-[11px] opacity-90">
              {message.replyTo.senderName}
            </span>
            <span className="truncate block opacity-80">{message.replyTo.content}</span>
          </div>
        )}

        {/* Message body container */}
        <div
          className={`relative px-3.5 py-2 rounded-2xl shadow-sm text-sm break-words ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-xs'
              : 'bg-slate-100 text-slate-900 border border-slate-200/70 rounded-bl-xs'
          }`}
        >
          {isDeleted ? (
            <div className="flex items-center gap-1.5 italic text-xs py-0.5 opacity-80">
              <Trash2 className="w-3.5 h-3.5 opacity-60" />
              <span>This message was deleted</span>
            </div>
          ) : (
            <>
              {/* Media Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="space-y-2 mb-2">
                  {message.attachments.map((att: MessageAttachment, idx: number) => {
                    const isImg = att.mimeType.startsWith('image/');
                    const isVid = att.mimeType.startsWith('video/');
                    const isAud = att.mimeType.startsWith('audio/');

                    if (isImg) {
                      return (
                        <div key={idx} className="overflow-hidden rounded-lg cursor-pointer">
                          <img
                            src={att.secureUrl || att.url}
                            alt={att.fileName}
                            className="max-h-60 rounded-lg object-cover hover:opacity-95 transition-opacity"
                            onClick={() => setSelectedImage(att.secureUrl || att.url)}
                          />
                        </div>
                      );
                    }

                    if (isAud) {
                      return (
                        <audio
                          key={idx}
                          controls
                          src={att.secureUrl || att.url}
                          className="w-full h-8"
                        />
                      );
                    }

                    return (
                      <a
                        key={idx}
                        href={att.secureUrl || att.url}
                        target="_blank"
                        rel="noreferrer"
                        download={att.fileName}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-colors ${
                          isOwn
                            ? 'bg-blue-700/60 hover:bg-blue-700 text-white'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                        }`}
                      >
                        <FileText className="w-4 h-4 shrink-0 text-blue-400" />
                        <span className="truncate flex-1">{att.fileName}</span>
                        <Download className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Text content */}
              {message.content && (
                <p className="whitespace-pre-wrap leading-relaxed select-text">
                  {message.content}
                </p>
              )}

              {/* Timestamp, Edited badge & Ticks */}
              <div
                className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                  isOwn ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {message.isEdited && (
                  <span className="italic opacity-80 mr-0.5">edited</span>
                )}
                <span>{formattedTime}</span>
                {renderDeliveryTick()}
              </div>
            </>
          )}
        </div>

        {/* Emoji Reactions row */}
        {message.reactions && Object.keys(message.reactions).length > 0 && !isDeleted && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(message.reactions).map(([emoji, userIds]) => {
              const hasReacted = userIds.includes(currentUserId);
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onToggleReaction?.(message.id, emoji)}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full border transition-all ${
                    hasReacted
                      ? 'bg-blue-50 border-blue-300 text-blue-700 scale-105'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] font-semibold">{userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Hover Action Toolbar */}
      {!isDeleted && (
        <div
          className={`hidden group-hover:flex items-center gap-0.5 p-1 bg-white border border-slate-200 rounded-full shadow-md text-slate-500 z-10 select-none ${
            isOwn ? 'order-first' : 'order-last'
          }`}
        >
          {/* Reaction Picker trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
              title="Add reaction"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-1 left-0 flex items-center gap-1 bg-white border border-slate-200 p-1.5 rounded-full shadow-lg z-20">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onToggleReaction?.(message.id, emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="hover:scale-125 transition-transform p-1 text-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reply */}
          <button
            type="button"
            onClick={() => onReply?.(message)}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
            title="Reply"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>

          {/* Copy Text */}
          {message.content && (
            <button
              type="button"
              onClick={handleCopyText}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
              title="Copy text"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* More options (Edit / Delete) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
                title="More"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? 'end' : 'start'} className="w-44 text-xs">
              {canEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit?.(message)}
                  className="cursor-pointer gap-2"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit message</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDeleteForMe?.(message.id)}
                className="cursor-pointer gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Delete for me</span>
              </DropdownMenuItem>
              {isOwn && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteForEveryone?.(message.id)}
                    className="cursor-pointer gap-2 text-rose-600 focus:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete for everyone</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Lightbox Dialog for Image Attachments */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl p-1 bg-black/90 border-0 flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Enlarged attachment"
              className="max-h-[85vh] w-auto rounded object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
