import type { User } from './user';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId?: string;
  content: string;
  mediaUrl?: string;
  isRead?: boolean;
  createdAt: string;
  sender: User;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface SendMessageDTO {
  recipientId: string;
  content: string;
  mediaUrl?: string;
}
