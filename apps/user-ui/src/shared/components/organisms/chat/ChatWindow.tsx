'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import useUser from 'apps/user-ui/src/hooks/userUser';
import { useWebSocket } from 'apps/user-ui/src/context/websocket-context';
import { useMarkAsSeen, useMessages } from 'apps/user-ui/src/hooks/chat';
import { ChatInput, ChatMessage } from '../../molecules';
import useSendMessage from 'apps/user-ui/src/hooks/chat/useSendMessage';
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
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, seller }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { isConnected, isConnecting, error: wsError, setMessageHandler } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();

  const messagesQuery = useMessages({
    conversationId: conversationId || '',
    page: 1,
    limit: 50,
  });

  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: markAsSeen, isPending: isMarking } = useMarkAsSeen();

  const { data, isLoading, isError, error } = messagesQuery;
  const sellerInfo = data?.seller || seller;

  useEffect(() => {
    if (data) {
      setMessages(data.messages);
    }
  }, [data]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as seen when conversation is selected
  useEffect(() => {
    if (conversationId && user?.id) {
      markAsSeen({ conversationId });
    }
  }, [conversationId, user?.id, markAsSeen]);

  // Receive new messages from websocket
  useEffect(() => {
    // Set the message handler
    const messageHandler = (type: string, data: any) => {
      if (type !== 'NEW_MESSAGE' || !data?.conversationId) {
        return;
      }

      const incomingConversationId = data.conversationId;

      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData) return oldData;

        const conversations = oldData.conversations || [];
        const nextConversation = conversations.find((conversation: any) => conversation.id === incomingConversationId);

        if (!nextConversation) {
          return oldData;
        }

        const updatedConversation = {
          ...nextConversation,
          lastMessage: {
            id: data.id || nextConversation.lastMessage?.id || data.messageId || '',
            content: data.content,
            senderId: data.senderId,
            senderType: data.senderType,
            createdAt: data.createdAt,
          },
          updatedAt: data.createdAt || new Date().toISOString(),
        };

        return {
          ...oldData,
          conversations: [
            updatedConversation,
            ...conversations.filter((conversation: any) => conversation.id !== incomingConversationId),
          ],
        };
      });

      if (incomingConversationId !== conversationId) {
        return;
      }

      queryClient.setQueryData(['messages', conversationId, 1, 50], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: [...oldData.messages, data],
        };
      });

      if (data.senderId !== user?.id && !isMarking) {
        markAsSeen({ conversationId });
      }
    };

    setMessageHandler(messageHandler);

    // Cleanup: remove the handler when component unmounts or dependencies change
    return () => {
      setMessageHandler(null);
    };
  }, [setMessageHandler, conversationId, queryClient, markAsSeen, isMarking, user?.id]);

  const handleSendMessage = (content: string) => {
    if (!conversationId || !user?.id || !sellerInfo) return;

    // Send message through the mutation hook
    sendMessage({
      conversationId,
      content,
      receiverId: sellerInfo.id,
      senderType: 'user',
      senderId: user.id,
    });

    setMessages([
      ...messages,
      { id: crypto.randomUUID(), content, senderId: user.id, senderType: 'user', createdAt: new Date().toISOString() },
    ]);
  };

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
    <div className="flex flex-col h-full min-w-0 min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 min-w-0">
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
                currentUserId={user?.id || ''}
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
        <div className="px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/20 flex-shrink-0">
          <p className="text-xs text-yellow-600 text-center">Connecting to chat server...</p>
        </div>
      )}
      {!isConnected && !isConnecting && wsError && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex-shrink-0">
          <p className="text-xs text-red-600 text-center">Connection failed: {wsError}</p>
        </div>
      )}

      {/* Chat Input */}
      <div className="flex-shrink-0">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={!isConnected || isSending}
          placeholder={isSending ? 'Sending...' : 'Type a message...'}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
