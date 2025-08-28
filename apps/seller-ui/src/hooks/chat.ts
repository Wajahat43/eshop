import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { ws, isConnected, error: wsError } = useWebSocket();

  return useMutation({
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
    },
  });
};

export const useMarkAsSeen = () => {
  const queryClient = useQueryClient();
  const { ws, isConnected, error: wsError } = useWebSocket();

  return useMutation({
    mutationFn: async (data: MarkAsSeenData) => {
      // Check WebSocket connection status
      if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error(`WebSocket not connected. Status: ${wsError || 'Connection failed'}`);
      }

      try {
        // Send mark as seen through WebSocket - server expects MARK_AS_SEEN
        ws.send(
          JSON.stringify({
            type: 'MARK_AS_SEEN',
            conversationId: data.conversationId,
            senderId: '', // Required by server but not used for this operation
            receiverId: '', // Required by server but not used for this operation
            messageBody: '', // Required by server but not used for this operation
            senderType: 'seller', // Required by server
          }),
        );
        return { unseenCount: 0 };
      } catch (error) {
        throw new Error(`Failed to mark as seen: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    onSuccess: (data, variables) => {
      // Update conversation list to clear unseen count
      queryClient.setQueryData(['seller-conversations'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          conversations: oldData.conversations.map((conv: Conversation) => {
            if (conv.id === variables.conversationId) {
              return {
                ...conv,
                unseenCount: data.unseenCount,
              };
            }
            return conv;
          }),
        };
      });

      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['seller-conversations'] });
    },
    onError: (error) => {
      console.error('Failed to mark as seen:', error);
    },
  });
};
