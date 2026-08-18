import { create } from 'zustand';
import type { Notification, ToastNotification } from '../types/notification';
import { notificationService } from '../services/notificationService';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  toasts: ToastNotification[];
  newPostsAvailable: boolean;
  newPostsCount: number;
  isLoading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  setNewPostAvailable: (available: boolean, increment?: boolean) => void;
  clearNewPostsBanner: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  toasts: [],
  newPostsAvailable: false,
  newPostsCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const list = await notificationService.getNotifications();
      const unread = list.filter((n) => !n.isRead).length;
      set({ notifications: list, unreadCount: unread, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => {
        const list = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        const unread = list.filter((n) => !n.isRead).length;
        return { notifications: list, unreadCount: unread };
      });
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },

  addNotification: (notification: Notification) => {
    set((state) => {
      const updated = [notification, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: state.unreadCount + 1,
      };
    });

    get().addToast({
      title: getToastTitle(notification),
      message: getToastMessage(notification),
      avatarUrl: notification.actor?.avatarUrl,
      type: notification.type,
    });
  },

  addToast: (toastData) => {
    const toast: ToastNotification = {
      ...toastData,
      id: 'toast_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    setTimeout(() => {
      get().removeToast(toast.id);
    }, 5000);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  setNewPostAvailable: (available: boolean, increment = true) => {
    set((state) => ({
      newPostsAvailable: available,
      newPostsCount: available ? (increment ? state.newPostsCount + 1 : state.newPostsCount) : 0,
    }));
  },

  clearNewPostsBanner: () => {
    set({ newPostsAvailable: false, newPostsCount: 0 });
  },
}));

function getToastTitle(notif: Notification): string {
  const name = notif.actor?.username || 'Someone';
  switch (notif.type) {
    case 'FOLLOW':
      return `${name} followed you`;
    case 'LIKE':
      return `${name} liked your post`;
    case 'COMMENT':
      return `${name} commented on your post`;
    case 'STORY_VIEW':
      return `${name} viewed your story`;
    case 'CHAT_MESSAGE':
      return `New message from ${name}`;
    default:
      return 'New Notification';
  }
}

function getToastMessage(notif: Notification): string {
  switch (notif.type) {
    case 'FOLLOW':
      return 'started following your activity.';
    case 'LIKE':
      return 'reacted to your shared media.';
    case 'COMMENT':
      return 'left a comment on your post.';
    case 'STORY_VIEW':
      return 'checked out your latest 24h story.';
    default:
      return 'Click to view details.';
  }
}
