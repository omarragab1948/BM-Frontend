import { apiClient } from './apiClient';
import type { Story, StoryFeedGroup, CreateStoryDTO, StoryViewerItem } from '../types/story';

export const storyService = {
  getStoriesFeed: async (): Promise<StoryFeedGroup[]> => {
    try {
      const response = await apiClient.get<StoryFeedGroup[]>('/api/stories/feed');
      return response.data;
    } catch (err: any) {
      if (err.message?.includes('404')) {
        const response = await apiClient.get<StoryFeedGroup[]>('/stories/feed');
        return response.data;
      }
      throw err;
    }
  },

  getUserStories: async (userId: string): Promise<Story[]> => {
    try {
      const response = await apiClient.get<Story[]>(`/api/stories/user/${userId}`);
      return response.data;
    } catch (err: any) {
      if (err.message?.includes('404')) {
        const response = await apiClient.get<Story[]>(`/stories/user/${userId}`);
        return response.data;
      }
      throw err;
    }
  },

  createStory: async (dto: CreateStoryDTO): Promise<Story> => {
    let fileToSend: File | undefined = dto.file;

    if (!fileToSend && dto.mediaUrl) {
      try {
        const res = await fetch(dto.mediaUrl);
        if (res.ok) {
          const blob = await res.blob();
          const mimeType = blob.type || 'image/jpeg';
          const ext = mimeType.split('/')[1] || 'jpg';
          fileToSend = new File([blob], `story_media.${ext}`, { type: mimeType });
        }
      } catch (err) {
        console.warn('Could not fetch mediaUrl to File:', err);
      }
    }

    if (!fileToSend) {
      throw new Error('A media file (image or video) is required for a story. Please select a photo or video file from your device.');
    }

    const formData = new FormData();
    formData.append('media', fileToSend);
    if (dto.caption) {
      formData.append('caption', dto.caption);
    }

    try {
      const response = await apiClient.post<Story>('/api/stories', formData);
      return response.data;
    } catch (err: any) {
      if (err.message?.includes('404')) {
        const response = await apiClient.post<Story>('/stories', formData);
        return response.data;
      }
      throw err;
    }
  },

  viewStory: async (storyId: string): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/api/stories/${storyId}/view`);
      return response.data;
    } catch (err: any) {
      if (err.message?.includes('404')) {
        const response = await apiClient.post<{ success: boolean }>(`/stories/${storyId}/view`);
        return response.data;
      }
      throw err;
    }
  },

  getStoryViewers: async (storyId: string): Promise<StoryViewerItem[]> => {
    try {
      const response = await apiClient.get<any>(`/api/stories/${storyId}/viewers`);
      const resData = response.data;
      const rawList = Array.isArray(resData) ? resData : Array.isArray(resData?.data) ? resData.data : [];
      return rawList.map((item: any) => {
        const u = item.user || item.viewer || item;
        return {
          id: u.id || item.id || String(Math.random()),
          name: u.name || u.displayName || u.username || 'User',
          username: u.username || 'user',
          avatarUrl: u.avatarUrl || u.avatar,
          viewedAt: item.createdAt || item.viewedAt || item.updatedAt || new Date().toISOString(),
        };
      });
    } catch (err: any) {
      try {
        const response = await apiClient.get<any>(`/stories/${storyId}/viewers`);
        const resData = response.data;
        const rawList = Array.isArray(resData) ? resData : Array.isArray(resData?.data) ? resData.data : [];
        return rawList.map((item: any) => {
          const u = item.user || item.viewer || item;
          return {
            id: u.id || item.id || String(Math.random()),
            name: u.name || u.displayName || u.username || 'User',
            username: u.username || 'user',
            avatarUrl: u.avatarUrl || u.avatar,
            viewedAt: item.createdAt || item.viewedAt || item.updatedAt || new Date().toISOString(),
          };
        });
      } catch {
        return [];
      }
    }
  },

  deleteStory: async (storyId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/stories/${storyId}`);
    } catch (err: any) {
      if (err.message?.includes('404')) {
        await apiClient.delete(`/stories/${storyId}`);
      } else {
        throw err;
      }
    }
  },
};

