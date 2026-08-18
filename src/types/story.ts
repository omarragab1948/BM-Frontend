import type { User } from './user';

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  caption?: string;
  createdAt: string;
  expiresAt?: string;
  viewsCount?: number;
  isViewed?: boolean;
  user?: User;
}

export interface StoryFeedGroup {
  user: User;
  stories: Story[];
  allViewed: boolean;
}

export interface CreateStoryDTO {
  mediaUrl?: string;
  caption?: string;
  file?: File;
}

export interface StoryViewerItem {
  id: string;
  name?: string;
  username: string;
  avatarUrl?: string;
  viewedAt: string;
}
