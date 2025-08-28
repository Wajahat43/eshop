'use client';

import React from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';

const EmptyChatState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <MessageCircle className="w-10 h-10 text-muted-foreground" />
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-3">Welcome to your inbox</h3>

      <p className="text-muted-foreground mb-6 max-w-md">
        Select a conversation from the left to start chatting with shops. Your messages will appear here in real-time.
      </p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="w-4 h-4" />
        <span>Choose a conversation to begin</span>
      </div>
    </div>
  );
};

export default EmptyChatState;
