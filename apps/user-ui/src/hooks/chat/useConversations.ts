import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';

interface Shop {
  id: string;
  name: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  seller: Shop;
  lastMessage: Message | null;
  isOnline: boolean;
  unseenCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

const fetchConversations = async (): Promise<ConversationsResponse> => {
  const response = await axiosInstance.get('/chat/api/get-user-conversations');
  return response.data;
};

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
