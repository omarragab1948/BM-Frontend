import type { User } from './user';

export type NotificationType =
  | 'FOLLOW'
  | 'LIKE'
  | 'COMMENT'
  | 'STORY_VIEW'
  | 'CHAT_MESSAGE'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
  actor: User;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  avatarUrl?: string;
  type?: NotificationType;
  timestamp: number;
}
