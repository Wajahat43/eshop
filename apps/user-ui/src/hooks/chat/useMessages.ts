import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';

interface Shop {
  id: string;
  name: string;
  email: string;
}

interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderType: string;
  status: string;
  createdAt: string;
}

interface MessagesResponse {
  messages: Message[];
  seller: Shop;
  currentPage: number;
  hasMore: boolean;
  totalMessages: number;
}

interface UseMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
}

const fetchMessages = async ({
  conversationId,
  page = 1,
  limit = 20,
}: UseMessagesParams): Promise<MessagesResponse> => {
  const response = await axiosInstance.get(`/chat/api/get-user-messages/${conversationId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const useMessages = ({ conversationId, page = 1, limit = 20 }: UseMessagesParams) => {
  return useQuery({
    queryKey: ['messages', conversationId, page, limit],
    queryFn: () => fetchMessages({ conversationId, page, limit }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!conversationId,
  });
};

// Infinite query for chat messages
export const useInfiniteMessages = ({ conversationId, limit = 20 }: { conversationId: string; limit?: number }) => {
  return useInfiniteQuery({
    queryKey: ['messages', 'infinite', conversationId, limit],
    queryFn: ({ pageParam = 1 }) => fetchMessages({ conversationId, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
