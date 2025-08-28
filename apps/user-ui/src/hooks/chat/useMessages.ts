import { useQuery } from '@tanstack/react-query';
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
