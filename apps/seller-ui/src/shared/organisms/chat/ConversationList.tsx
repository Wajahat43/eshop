'use client';

import React from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import ConversationItem from '../../molecules/chat/ConversationItem';
import { useConversations } from 'apps/seller-ui/src/hooks/chat';

interface ConversationListProps {
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ selectedConversationId, onConversationSelect }) => {
  const conversationsQuery = useConversations();
  const { data, isLoading, isError, error } = conversationsQuery;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Error loading conversations</h3>
        <p className="text-muted-foreground text-center mb-4">
          {error?.message || 'Something went wrong while loading your conversations.'}
        </p>
        <button
          onClick={() => conversationsQuery.refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  const conversations = data?.conversations || [];

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No conversations yet</h3>
        <p className="text-muted-foreground text-center">
          Start chatting with customers to see your conversations here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Messages</h2>
        <p className="text-sm text-muted-foreground">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-border">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedConversationId === conversation.id}
            onClick={() => onConversationSelect(conversation.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
