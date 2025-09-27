import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosIsntance';
import { useWebSocket } from '../context/websocket-context';

// Types
interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Conversation {
  id: string;
  user: User;
  lastMessage: Message | null;
  isOnline: boolean;
  unseenCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SendMessageData {
  conversationId: string;
  content: string;
  receiverId: string;
  senderType: string;
  senderId: string;
}

interface MarkAsSeenData {
  conversationId: string;
}

// API functions
const fetchSellerConversations = async (): Promise<{ conversations: Conversation[] }> => {
  const response = await axiosInstance.get('/chat/api/get-seller-conversations');
  return response.data;
};

const fetchSellerMessages = async ({
  conversationId,
  page = 1,
  limit = 20,
}: {
  conversationId: string;
  page?: number;
  limit?: number;
}): Promise<{
  messages: Message[];
  user: User;
  currentPage: number;
  hasMore: boolean;
  totalMessages: number;
}> => {
  const response = await axiosInstance.get(
    `/chat/api/get-seller-messages/${conversationId}?page=${page}&limit=${limit}`,
  );
  return response.data;
};

// Hooks
export const useWebSocketStatus = () => {
  const { isConnected, isConnecting, error } = useWebSocket();

  return {
    isConnected,
    isConnecting,
    error,
    status: isConnecting ? 'connecting' : isConnected ? 'connected' : 'disconnected',
    canSendMessage: isConnected && !isConnecting,
  };
};

export const useConversations = () => {
  return useQuery({
    queryKey: ['seller-conversations'],
    queryFn: fetchSellerConversations,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time updates
  });
};

export const useMessages = ({
  conversationId,
  page,
  limit,
}: {
  conversationId: string;
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ['seller-messages', conversationId],
    queryFn: () => fetchSellerMessages({ conversationId, page, limit }),
    enabled: !!conversationId,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 10, // Refetch every 10 seconds for real-time updates
  });
};

// Infinite query for seller chat messages
export const useInfiniteMessages = ({ conversationId, limit = 20 }: { conversationId: string; limit?: number }) => {
  return useInfiniteQuery({
    queryKey: ['seller-messages', 'infinite', conversationId, limit],
    queryFn: ({ pageParam = 1 }) => fetchSellerMessages({ conversationId, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!conversationId,
    staleTime: 1000 * 10, // 10 seconds
    refetchOnWindowFocus: false,
  });
};

export const useSendMessage = () => {
  const { ws, isConnected, error: wsError } = useWebSocket();

  return useMutation<
    { conversationId: string },
    Error,
    SendMessageData,
    {
      previousData?: { conversations: Conversation[] };
      previousUnreadCount?: number;
    }
  >({
    mutationFn: async (data: SendMessageData) => {
      // Check WebSocket connection status
      if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error(`WebSocket not connected. Status: ${wsError || 'Connection failed'}`);
      }

      // Send message through WebSocket
      ws.send(
        JSON.stringify({
          type: 'NEW_MESSAGE',
          senderId: data.senderId,
          receiverId: data.receiverId,
          messageBody: data.content,
          conversationId: data.conversationId,
          senderType: data.senderType,
        }),
      );

      return { conversationId: data.conversationId };
    },
  });
};

export const useMarkAsSeen = () => {
  const queryClient = useQueryClient();
  const { ws, isConnected, error: wsError, unreadCounts, updateUnreadCount, removeUnreadCount } = useWebSocket();

  return useMutation<
    { conversationId: string },
    Error,
    MarkAsSeenData,
    {
      previousData?: { conversations: Conversation[] };
      previousUnreadCount?: number;
      hadUnreadEntry: boolean;
    }
  >({
    mutationFn: async ({ conversationId }: MarkAsSeenData) => {
      if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error(`WebSocket not connected. Status: ${wsError || 'Connection failed'}`);
      }

      ws.send(
        JSON.stringify({
          type: 'MARK_AS_SEEN',
          conversationId,
          senderId: '',
          receiverId: '',
          messageBody: '',
          senderType: 'seller',
        }),
      );

      return { conversationId };
    },
    onMutate: async ({ conversationId }) => {
      await queryClient.cancelQueries({ queryKey: ['seller-conversations'] });

      const previousData = queryClient.getQueryData<{ conversations: Conversation[] }>(['seller-conversations']);
      const hadUnreadEntry = Object.prototype.hasOwnProperty.call(unreadCounts, conversationId);
      const previousUnreadCount = unreadCounts[conversationId];

      queryClient.setQueryData(['seller-conversations'], (oldData: { conversations: Conversation[] } | undefined) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          conversations: oldData.conversations.map((conv: Conversation) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  unseenCount: 0,
                }
              : conv,
          ),
        };
      });

      updateUnreadCount(conversationId, 0);

      return { previousData, previousUnreadCount, hadUnreadEntry };
    },
    onError: (error, variables, context) => {
      console.error('Failed to mark as seen:', error);
      if (context?.previousData) {
        queryClient.setQueryData(['seller-conversations'], context.previousData);
      }
      if (context?.hadUnreadEntry && context.previousUnreadCount !== undefined) {
        updateUnreadCount(variables.conversationId, context.previousUnreadCount);
      } else if (context && !context.hadUnreadEntry) {
        removeUnreadCount(variables.conversationId);
      }
    },
  });
};
