import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '../../context/websocket-context';

interface SendMessageData {
  conversationId: string;
  content: string;
  receiverId: string;
  senderId: string;
  senderType: 'user';
}

export interface SentMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderType: string;
  status: 'pending' | 'sent' | 'delivered' | 'read';
  createdAt: string;
}

const useSendMessage = () => {
  const { ws, isConnected } = useWebSocket();

  const mutation = useMutation({
    mutationFn: async (data: SendMessageData) => {
      if (!isConnected || !ws) {
        throw new Error('WebSocket not connected');
      }

      // Send message via WebSocket
      ws.send(
        JSON.stringify({
          type: 'NEW_MESSAGE',
          conversationId: data.conversationId,
          messageBody: data.content,
          receiverId: data.receiverId,
          senderId: data.senderId,
          senderType: data.senderType,
        }),
      );
    },
  });

  return mutation;
};

export default useSendMessage;
