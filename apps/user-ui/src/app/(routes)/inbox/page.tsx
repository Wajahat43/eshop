'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConversationList, ChatWindow, ChatHeader, EmptyChatState } from '../../../shared/components/organisms/chat';
import { useConversations } from '../../../hooks/chat';
import { useWebSocket } from '../../../context/websocket-context';

const InboxPage: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { isConnected, isConnecting, error, ws } = useWebSocket();

  const conversationsQuery = useConversations();
  const conversations = conversationsQuery.data?.conversations || [];

  // Handle shopId or conversationId from URL query parameter (for direct navigation from product page)
  useEffect(() => {
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Direct navigation with conversation ID
      const conversation = conversations.find((conv) => conv.id === conversationId);
      if (conversation) {
        setSelectedConversationId(conversationId);
        setSelectedSeller(conversation.seller);
        // Update URL to remove query parameters
        router.replace('/inbox');
      }
    }
  }, [searchParams, conversations, router]);

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    const conversation = conversations.find((conv) => conv.id === conversationId);
    if (conversation) {
      setSelectedConversationId(conversationId);
      setSelectedSeller(conversation.seller);

      // Update URL to remove query parameters if they exist
      if (searchParams.get('shopId') || searchParams.get('conversationId')) {
        router.replace('/inbox');
      }

      //Also mark it as seen using ws
      ws?.send(
        JSON.stringify({
          type: 'MARK_AS_SEEN',
          conversationId: conversationId,
        }),
      );
    }
  };

  // Get selected conversation data
  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);

  return (
    <div className="h-screen bg-background">
      {/* Header */}
      <div className="h-16 border-b border-border bg-card flex items-center px-6">
        <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
        {isConnecting && (
          <div className="ml-4 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <span className="text-xs text-yellow-600">Connecting...</span>
          </div>
        )}
        {!isConnected && !isConnecting && error && (
          <div className="ml-4 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <span className="text-xs text-red-600">Connection failed</span>
          </div>
        )}
      </div>

      {/* Main Chat Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Conversations List */}
        <div className="w-80 border-r border-border bg-card flex-shrink-0">
          <ConversationList
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
          />
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedConversationId && selectedSeller ? (
            <>
              {/* Chat Header */}
              <ChatHeader seller={selectedSeller} lastSeen={selectedConversation?.lastMessage?.createdAt} />

              {/* Chat Window */}
              <ChatWindow conversationId={selectedConversationId} seller={selectedSeller} />
            </>
          ) : (
            <EmptyChatState />
          )}
        </div>
      </div>

      {/* Mobile Responsive Overlay */}
      <div className="lg:hidden">{/* Mobile conversation list overlay would go here */}</div>
    </div>
  );
};

export default InboxPage;
