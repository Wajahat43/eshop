import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '../../context/websocket-context';

interface MarkAsSeenData {
  conversationId: string;
}

interface MarkAsSeenResponse {
  success: boolean;
}

const markAsSeen = async (data: MarkAsSeenData): Promise<MarkAsSeenResponse> => {
  // For now, we'll just return success since the actual marking is handled by WebSocket
  return { success: true };
};

export const useMarkAsSeen = () => {
  const queryClient = useQueryClient();
  const { sendMessage: wsSendMessage } = useWebSocket();

  return useMutation({
    mutationFn: markAsSeen,
    onSuccess: (data, variables) => {
      // Send mark as seen message via WebSocket
      wsSendMessage({
        type: 'MARK_AS_SEEN',
        conversationId: variables.conversationId,
      });

      // Invalidate conversations query to update unread counts
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
