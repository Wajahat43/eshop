'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import useSeller from '../../../hooks/useSeller';
import { useWebSocket } from '../../../context/websocket-context';
import { useMarkAsSeen, useMessages, useSendMessage } from '../../../hooks/chat';
import { ChatInput, ChatMessage } from '../../molecules';
import { useQueryClient } from '@tanstack/react-query';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: string;
  createdAt: string;
}

interface ChatWindowProps {
  conversationId: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, user }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { seller } = useSeller();
  const { isConnected, isConnecting, error: wsError, ws, setMessageHandler } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();

  const messagesQuery = useMessages({
    conversationId: conversationId || '',
    page: 1,
    limit: 50,
  });
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const markAsSeenMutation = useMarkAsSeen();

  const { data, isLoading, isError, error } = messagesQuery;
  const userInfo = data?.user || user;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as seen when conversation is selected
  useEffect(() => {
    if (conversationId && seller?.id) {
      markAsSeenMutation.mutate({ conversationId });
    }
  }, [conversationId, seller?.id]);

  const handleSendMessage = (content: string) => {
    if (!conversationId || !seller?.id || !userInfo) return;

    // Send message through the mutation hook
    sendMessage({
      conversationId,
      content,
      receiverId: userInfo.id,
      senderType: 'seller',
      senderId: seller.id,
    });

    setMessages([
      ...messages,
      {
        id: crypto.randomUUID(),
        content,
        senderId: seller.id,
        senderType: 'seller',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  useEffect(() => {
    if (data) {
      setMessages(data.messages);
    }
  }, [data]);

  //Receive new messages from websocket
  useEffect(() => {
    const messageHandler = (type: string, data: any) => {
      if (type === 'NEW_MESSAGE') {
        if (data.conversationId === conversationId) {
          queryClient.setQueryData(['seller-messages', conversationId], (oldData: any) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              messages: [...oldData.messages, data],
            };
          });
        }
      }
    };

    setMessageHandler(messageHandler);

    return () => {
      setMessageHandler(null);
    };
  }, [setMessageHandler, conversationId, queryClient]);

  if (!conversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
        <p className="text-muted-foreground text-center">Choose a conversation from the list to start chatting.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Error loading messages</h3>
        <p className="text-muted-foreground text-center mb-4">
          {error?.message || 'Something went wrong while loading messages.'}
        </p>
        <button
          onClick={() => messagesQuery.refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
            <p className="text-muted-foreground">Start the conversation by sending your first message!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                currentSellerId={seller?.id || ''}
                isLastMessage={index === messages.length - 1}
              />
            ))}
            {isSending && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Sending message...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Connection Status */}
      {isConnecting && (
        <div className="px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/20">
          <p className="text-xs text-yellow-600 text-center">Connecting to chat server...</p>
        </div>
      )}
      {!isConnected && !isConnecting && wsError && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-xs text-red-600 text-center">Connection failed: {wsError}</p>
        </div>
      )}

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={!isConnected || isSending}
        placeholder={isSending ? 'Sending...' : 'Type a message...'}
      />
    </div>
  );
};

export default ChatWindow;
