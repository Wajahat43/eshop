export type IncomingMessage = {
  type?: string;
  senderId: string;
  receiverId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
};

export type MessagePayload = {
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
};

export type MessageEvent = {
  type: string;
  payload: any;
};
