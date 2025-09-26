'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConversationList, ChatWindow, ChatHeader, EmptyChatState } from '../../../shared/components/organisms/chat';
import { useConversations, useMarkAsSeen } from '../../../hooks/chat';
import { useWebSocket } from '../../../context/websocket-context';
import ProtectedRoute from '../../../shared/components/guards/protected-route';

const InboxPage: React.FC = () => {
  return (
    <ProtectedRoute fallback={<InboxLoadingFallback />}>
      <InboxContent />
    </ProtectedRoute>
  );
};

const InboxLoadingFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      <div>
        <p className="text-base font-semibold text-foreground">Loading your conversations</p>
        <p className="text-sm text-muted-foreground">We&apos;ll redirect you right back here after you sign in.</p>
      </div>
    </div>
  </div>
);

const InboxContent: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { isConnected, isConnecting, error } = useWebSocket();
  const { mutate: markConversationAsSeen } = useMarkAsSeen();

  const conversationsQuery = useConversations();
  const conversations = useMemo(
    () => conversationsQuery.data?.conversations || [],
    [conversationsQuery.data?.conversations],
  );

  useEffect(() => {
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      const conversation = conversations.find((conv) => conv.id === conversationId);
      if (conversation) {
        setSelectedConversationId(conversationId);
        setSelectedSeller(conversation.seller);
        router.replace('/inbox');
      }
    }
  }, [searchParams, conversations, router]);

  const handleConversationSelect = (conversationId: string) => {
    const conversation = conversations.find((conv) => conv.id === conversationId);
    if (conversation) {
      setSelectedConversationId(conversationId);
      setSelectedSeller(conversation.seller);

      if (searchParams.get('shopId') || searchParams.get('conversationId')) {
        router.replace('/inbox');
      }

      markConversationAsSeen({ conversationId });
    }
  };

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex h-16 items-center border-b border-border bg-card px-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
        {isConnecting && (
          <div className="ml-4 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1">
            <span className="text-xs text-yellow-600">Connecting...</span>
          </div>
        )}
        {!isConnected && !isConnecting && error && (
          <div className="ml-4 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1">
            <span className="text-xs text-red-600">Connection failed</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-80 flex-shrink-0 border-r border-border bg-card">
          <ConversationList
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
          />
        </div>

        <div className="flex flex-1 flex-col bg-background min-w-0 min-h-0">
          {selectedConversationId && selectedSeller ? (
            <>
              <ChatHeader seller={selectedSeller} lastSeen={selectedConversation?.lastMessage?.createdAt} />
              <ChatWindow conversationId={selectedConversationId} seller={selectedSeller} />
            </>
          ) : (
            <EmptyChatState />
          )}
        </div>
      </div>

      <div className="lg:hidden">{/* Mobile conversation list overlay would go here */}</div>
    </div>
  );
};

export default InboxPage;
