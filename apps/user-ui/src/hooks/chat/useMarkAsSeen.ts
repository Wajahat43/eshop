import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '../../context/websocket-context';

interface MarkAsSeenData {
  conversationId: string;
}

interface ConversationsCache {
  conversations: Array<{
    id: string;
    unseenCount: number;
    [key: string]: any;
  }>;
}

export const useMarkAsSeen = () => {
  const queryClient = useQueryClient();
  const { ws, isConnected, error: wsError, unreadCounts, updateUnreadCount, removeUnreadCount } = useWebSocket();

  return useMutation<
    { conversationId: string },
    Error,
    MarkAsSeenData,
    {
      previousData?: ConversationsCache;
      previousUnreadCount?: number;
      hadUnreadEntry: boolean;
    }
  >({
    mutationFn: async ({ conversationId }: MarkAsSeenData) => {
      if (!ws || !isConnected || ws.readyState !== WebSocket.OPEN) {
        throw new Error(`WebSocket not connected. Status: ${wsError || 'Connection failed'}`);
      }

      ws.send(
        JSON.stringify({
          type: 'MARK_AS_SEEN',
          conversationId,
        }),
      );

      return { conversationId };
    },
    onMutate: async ({ conversationId }) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });

      const previousData = queryClient.getQueryData<ConversationsCache>(['conversations']);
      const hadUnreadEntry = Object.prototype.hasOwnProperty.call(unreadCounts, conversationId);
      const previousUnreadCount = unreadCounts[conversationId];

      queryClient.setQueryData<ConversationsCache | undefined>(['conversations'], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          conversations: oldData.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  unseenCount: 0,
                }
              : conversation,
          ),
        };
      });

      updateUnreadCount(conversationId, 0);

      return { previousData, previousUnreadCount, hadUnreadEntry };
    },
    onError: (_error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['conversations'], context.previousData);
      }
      if (context?.hadUnreadEntry && context.previousUnreadCount !== undefined) {
        updateUnreadCount(variables.conversationId, context.previousUnreadCount);
      } else if (context && !context.hadUnreadEntry) {
        removeUnreadCount(variables.conversationId);
      }
    },
  });
};
