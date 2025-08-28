'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';

interface Seller {
  id: string;
  name: string;
  email: string;
}

interface WebSocketMessage {
  type: string;
  payload?: any;
  conversationId?: string;
  count?: number;
}

interface WebSocketContextType {
  ws: WebSocket | null;
  unreadCounts: Record<string, number>;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  setMessageHandler: (handler: ((type: string, data: any) => void) | null) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  seller: Seller;
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ seller, children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Single message handler stored in ref
  const messageHandlerRef = useRef<((type: string, data: any) => void) | null>(null);

  // Set the message handler
  const setMessageHandler = (handler: ((type: string, data: any) => void) | null) => {
    messageHandlerRef.current = handler;
  };

  useEffect(() => {
    if (!seller?.id) return;

    const wsUri = process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URI || 'ws://localhost:6005';

    setIsConnecting(true);
    setError(null);

    const websocket = new WebSocket(wsUri);
    wsRef.current = websocket;

    websocket.onopen = () => {
      websocket.send(`seller_${seller.id}`);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    };

    websocket.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setError('WebSocket connection closed');
    };

    websocket.onerror = (event) => {
      setIsConnected(false);
      setIsConnecting(false);
      setError('WebSocket connection error');
    };

    websocket.onmessage = (event) => {
      console.log('Teri khair data', event);
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        // Handle different message types
        switch (data.type) {
          case 'UNSEEN_COUNT_UPDATE':
            // The chat service sends this with payload.unseenCount and conversationId in the payload
            if (data.payload && data.payload.unseenCount !== undefined) {
              // Extract conversationId from the payload or use a default key
              const conversationId = data.payload.conversationId || 'default';
              setUnreadCounts((prev) => ({
                ...prev,
                [conversationId]: data.payload.unseenCount,
              }));
            }
            break;
          case 'NEW_MESSAGE':
            // Call the message handler if it exists
            if (messageHandlerRef.current) {
              messageHandlerRef.current('NEW_MESSAGE', data.payload);
            }
            break;
          default:
            // Call the message handler for other message types
            if (messageHandlerRef.current) {
              messageHandlerRef.current(data.type, data);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Cleanup on unmount
    return () => {
      websocket.close();
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [seller?.id]);

  const value: WebSocketContextType = {
    ws: wsRef.current,
    unreadCounts,
    isConnected,
    isConnecting,
    error,
    setMessageHandler,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);

  // Return default context when WebSocket provider is not available
  if (context === undefined) {
    return {
      ws: null,
      unreadCounts: {},
      isConnected: false,
      isConnecting: false,
      error: 'WebSocket not available',
      setMessageHandler: () => {
        // No-op function
      },
    };
  }

  return context;
};
