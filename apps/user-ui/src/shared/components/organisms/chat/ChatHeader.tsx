'use client';

import React from 'react';

interface ChatHeaderProps {
  seller: {
    id: string;
    name: string;
    email: string;
  };

  lastSeen?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ seller, lastSeen }) => {
  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
      {/* Avatar with Online Status */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {seller.name ? (
            <span className="text-base font-semibold text-muted-foreground">{seller.name.charAt(0).toUpperCase()}</span>
          ) : (
            <span className="text-base font-semibold text-muted-foreground">S</span>
          )}
        </div>
      </div>

      {/* Shop Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{seller.name}</h3>
        <div className="flex items-center gap-2">
          {lastSeen && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">Last seen {formatLastSeen(lastSeen)}</span>
            </>
          )}
        </div>
      </div>

      {/* Additional Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
