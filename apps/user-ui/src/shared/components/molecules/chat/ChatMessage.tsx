'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    senderType: string;
    createdAt: string;
  };
  currentUserId: string;
  isLastMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserId, isLastMessage = false }) => {
  const isOwnMessage = message.senderId === currentUserId;
  const messageTime = new Date(message.createdAt);
  const now = new Date();
  const isToday = messageTime.toDateString() === now.toDateString();

  const formatTime = (date: Date) => {
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div
      className={twMerge(
        'flex w-full mb-3 transition-all duration-200',
        isOwnMessage ? 'justify-end' : 'justify-start',
        isLastMessage && 'animate-fade-in',
      )}
    >
      <div
        className={twMerge(
          'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm transition-all duration-200',
          isOwnMessage ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md',
        )}
      >
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
        <div
          className={twMerge(
            'text-xs mt-1 opacity-70 text-right',
            isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground',
          )}
        >
          {formatTime(messageTime)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
