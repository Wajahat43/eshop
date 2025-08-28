import { WebSocket } from 'ws';
import { IncomingMessage, MessagePayload, MessageEvent } from './types';

export function generateRedisKey(userId: string): string {
  const isSeller = userId.startsWith('seller_');
  return isSeller ? `online:seller:${userId.replace('seller_', '')}` : `online:user:${userId}`;
}

export function generateUserKey(userId: string, userType: string): string {
  return userType === 'seller' ? `seller_${userId}` : `user_${userId}`;
}

export function handleSeenMessage(userId: string, conversationId: string, unseenCount: Map<string, number>): void {
  const seenKey = `${userId}_${conversationId}`;
  unseenCount.set(seenKey, 0);
}

export function validateMessage(message: IncomingMessage): boolean {
  return !!(message && message.receiverId && message.messageBody && message.conversationId && message.senderType);
}

export function createMessageEvent(message: IncomingMessage): { payload: MessagePayload; event: MessageEvent } {
  const payload: MessagePayload = {
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderType: message.senderType,
    content: message.messageBody,
    createdAt: new Date().toISOString(),
  };

  const event: MessageEvent = {
    type: 'NEW_MESSAGE',
    payload,
  };

  return { payload, event };
}

export function updateUnseenCount(
  receiverKey: string,
  conversationId: string,
  unseenCount: Map<string, number>,
): number {
  const unseenKey = `${receiverKey}_${conversationId}`;
  const prevCount = unseenCount.get(unseenKey) || 0;
  unseenCount.set(unseenKey, prevCount + 1);
  return prevCount + 1;
}

export function sendMessageToUser(
  userKey: string,
  messageEvent: MessageEvent,
  connectedUsers: Map<string, WebSocket>,
): boolean {
  const userSocket = connectedUsers.get(userKey);

  if (userKey && userSocket?.readyState === WebSocket.OPEN) {
    userSocket.send(JSON.stringify(messageEvent));
    return true;
  }
  return false;
}

export function sendUnseenCountUpdate(
  receiverKey: string,
  count: number,
  connectedUsers: Map<string, WebSocket>,
  conversationId: string,
): void {
  const unseenCountEvent: MessageEvent = {
    type: 'UNSEEN_COUNT_UPDATE',
    payload: { unseenCount: count, conversationId },
  };
  sendMessageToUser(receiverKey, unseenCountEvent, connectedUsers);
}
