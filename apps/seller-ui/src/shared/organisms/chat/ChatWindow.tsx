'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import useSeller from '../../../hooks/useSeller';
import { useWebSocket } from '../../../context/websocket-context';
import { useMarkAsSeen, useInfiniteMessages, useSendMessage } from '../../../hooks/chat';
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { seller } = useSeller();
  const { isConnected, isConnecting, error: wsError, setMessageHandler } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();

  const messagesQuery = useInfiniteMessages({
    conversationId: conversationId || '',
    limit: 20,
  });
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: markAsSeen, isPending: isMarking } = useMarkAsSeen();

  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = messagesQuery;

  // Flatten all messages from all pages and sort by creation date
  const allMessages = useMemo(() => {
    if (!data?.pages) return [];

    const messages = data.pages.flatMap((page) => page.messages);
    // Sort by createdAt to ensure proper chronological order
    return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [data?.pages]);
  const userInfo = data?.pages[0]?.user || user;

  // Scroll to bottom when new messages arrive (only for new messages, not when loading more)
  useEffect(() => {
    // Only auto-scroll if we're not currently loading more messages
    // and if the user is near the bottom of the chat
    if (!isFetchingNextPage && messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold

      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isFetchingNextPage]);

  // Handle scroll to load more messages
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight } = e.currentTarget;

    // Load more messages when scrolled to top
    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      // Store current scroll height to maintain position after loading
      const currentScrollHeight = scrollHeight;

      fetchNextPage().then(() => {
        // After loading, adjust scroll to maintain position
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          const heightDifference = newScrollHeight - currentScrollHeight;
          messagesContainerRef.current.scrollTop = heightDifference;
        }
      });
    }
  };

  // Mark messages as seen when conversation is selected
  useEffect(() => {
    if (conversationId && seller?.id) {
      markAsSeen({ conversationId });
    }
  }, [conversationId, seller?.id, markAsSeen]);

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
    if (allMessages.length > 0) {
      setMessages(allMessages);
    }
  }, [allMessages]);

  //Receive new messages from websocket
  useEffect(() => {
    const messageHandler = (type: string, data: any) => {
      if (type !== 'NEW_MESSAGE' || !data?.conversationId) {
        return;
      }

      const incomingConversationId = data.conversationId;

      queryClient.setQueryData(['seller-conversations'], (oldData: any) => {
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

      // Update infinite query data - add new message to the last page (most recent)
      queryClient.setQueryData(['seller-messages', 'infinite', conversationId, 20], (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = [...oldData.pages];
        if (newPages.length > 0) {
          const lastPageIndex = newPages.length - 1;
          newPages[lastPageIndex] = {
            ...newPages[lastPageIndex],
            messages: [...newPages[lastPageIndex].messages, data],
          };
        }

        return {
          ...oldData,
          pages: newPages,
        };
      });

      if (data.senderId !== seller?.id && !isMarking && conversationId) {
        markAsSeen({ conversationId });
      }
    };

    setMessageHandler(messageHandler);

    return () => {
      setMessageHandler(null);
    };
  }, [setMessageHandler, conversationId, queryClient, markAsSeen, isMarking, seller?.id]);

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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={handleScroll}>
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
            {/* Load more indicator */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading more messages...</span>
              </div>
            )}

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
