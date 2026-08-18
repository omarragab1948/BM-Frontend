import { apiClient } from './apiClient';
import type { Notification } from '../types/notification';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<any>('/api/notifications');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/api/notifications/read-all');
  },
};
