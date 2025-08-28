# Chat System Setup Guide

## Environment Variables

Create a `.env.local` file in the `apps/user-ui` directory with the following:

```bash
# Chat Service Configuration
NEXT_PUBLIC_CHAT_WEBSOCKET_URI=ws://localhost:6005
```

## Features Implemented

### ✅ WebSocket Infrastructure

- WebSocket context provider with real-time connection management
- Automatic reconnection handling
- User registration on connection

### ✅ Chat Hooks

- `useConversations` - Fetch user conversations
- `useMessages` - Fetch messages with pagination
- `useCreateConversation` - Start new conversations
- `useSendMessage` - Send messages via WebSocket
- `useMarkAsSeen` - Mark messages as read

### ✅ Chat Components

- **Molecules**: ChatMessage, ChatInput, ConversationItem, UnreadBadge, OnlineIndicator
- **Organisms**: ConversationList, ChatWindow, ChatHeader, EmptyChatState

### ✅ Real-time Features

- Live message delivery
- Online/offline status indicators
- Unread message counts
- Read receipts

### ✅ User Experience

- Modern chat interface with message bubbles
- Responsive design for mobile/desktop
- Loading states and error handling
- Micro-animations and smooth transitions
- WhatsApp-style timestamps

## Usage

1. **From Product Page**: Click "Chat" button to open inbox with specific shop
2. **Direct Access**: Navigate to `/inbox` to see all conversations
3. **Real-time Chat**: Messages are delivered instantly via WebSocket
4. **Conversation Management**: Switch between different shop conversations

## Backend Integration

The chat system integrates with:

- Chat service backend (`/chat/*` endpoints)
- WebSocket server for real-time communication
- Prisma database for message persistence

## Styling

All components use design tokens from `global.css`:

- No hardcoded colors
- Consistent spacing and typography
- Dark/light theme support
- Smooth animations and transitions
