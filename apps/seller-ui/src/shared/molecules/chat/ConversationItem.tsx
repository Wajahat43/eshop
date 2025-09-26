'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

import UnreadBadge from './UnreadBadge';
import { useWebSocket } from 'apps/seller-ui/src/context/websocket-context';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: string;
  createdAt: string;
}

interface ConversationItemProps {
  conversation: {
    id: string;
    user: User;
    lastMessage: Message | null;
    isOnline: boolean;
    unseenCount: number;
    createdAt: string;
    updatedAt: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, isSelected, onClick }) => {
  const { unreadCounts } = useWebSocket();
  const unseenCount = unreadCounts[conversation.id] ?? conversation.unseenCount;

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const truncateMessage = (text: string, maxLength = 30) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div
      onClick={onClick}
      className={twMerge(
        'flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 hover:bg-muted/50 rounded-lg',
        isSelected && 'bg-primary/10 border border-primary/20',
      )}
    >
      {/* Avatar with Online Status */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {conversation?.user?.name ? (
            <span className="text-lg font-semibold text-muted-foreground">
              {conversation.user.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <span className="text-lg font-semibold text-muted-foreground">U</span>
          )}
        </div>
      </div>

      {/* Conversation Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={twMerge('font-semibold text-foreground truncate', isSelected && 'text-primary')}>
            {conversation?.user?.name}
          </h4>
          {conversation?.lastMessage && (
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {formatLastMessageTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>

        {conversation?.lastMessage ? (
          <p className="text-sm text-muted-foreground truncate">{truncateMessage(conversation.lastMessage.content)}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">Start a conversation</p>
        )}
      </div>

      {/* Unread Badge */}
      {unseenCount > 0 && <UnreadBadge count={unseenCount} />}
    </div>
  );
};

export default ConversationItem;
