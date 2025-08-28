import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axiosInstance';

interface CreateConversationData {
  sellerId: string;
}

interface Conversation {
  id: string;
  isGroup: boolean;
  participantIds: string[];
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  participants: any[];
}

interface CreateConversationResponse {
  conversation: Conversation;
  isNew: boolean;
}

const createConversation = async (data: CreateConversationData): Promise<CreateConversationResponse> => {
  const response = await axiosInstance.post('/chat/api/create-conversation', data);
  return response.data;
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      // Invalidate conversations query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
