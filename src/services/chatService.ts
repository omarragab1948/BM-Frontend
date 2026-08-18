import { apiClient } from './apiClient';
import type { Conversation, Message, SendMessageDTO } from '../types/chat';

export const chatService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get<any>('/api/chat/conversations');
    const rawList: any[] = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    return rawList.map((c: any) => ({
      id: c.id,
      participant: c.participant || c.recipient || {
        id: c.recipientId || c.id || '',
        username: c.username || 'User',
        avatarUrl: c.avatarUrl || c.avatar,
      },
      lastMessage: c.lastMessage,
      unreadCount: c.unreadCount || 0,
      updatedAt: c.updatedAt || new Date().toISOString(),
    }));
  },

  getMessages: async (recipientId: string): Promise<Message[]> => {
    const response = await apiClient.get<any>(`/api/chat/messages/${recipientId}`);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  sendMessage: async (dto: SendMessageDTO): Promise<Message> => {
    const response = await apiClient.post<Message>('/api/chat/messages', dto);
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<void> => {
    await apiClient.patch(`/api/chat/messages/${messageId}/read`);
  },
};

