'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const isMessageEmpty = !message.trim();
  const canSend = !isMessageEmpty && !disabled;

  return (
    <div className="flex items-end gap-3 p-4 bg-card border-t border-border flex-shrink-0 min-w-0">
      <div className="flex-1 relative min-w-0">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={twMerge(
            'w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-input',
            'transition-all duration-200 min-h-[44px] max-h-[120px]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'overflow-y-auto',
          )}
          rows={1}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!canSend}
        className={twMerge(
          'flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 flex-shrink-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          canSend
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-md'
            : 'bg-muted text-muted-foreground cursor-not-allowed',
        )}
      >
        <Send
          size={20}
          className={twMerge('transition-transform duration-200', canSend && 'group-hover:translate-x-0.5')}
        />
      </button>
    </div>
  );
};

export default ChatInput;
