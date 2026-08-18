import { apiClient } from './apiClient';
import type { BlockActionResponse, BlockStatusResponse, BlockedUserItem } from '../types/block';

export const blockService = {
  blockUser: async (userId: string): Promise<BlockActionResponse> => {
    const response = await apiClient.post<BlockActionResponse>(`/api/blocks/${userId}`);
    return response.data;
  },

  unblockUser: async (userId: string): Promise<BlockActionResponse> => {
    const response = await apiClient.delete<BlockActionResponse>(`/api/blocks/${userId}`);
    return response.data;
  },

  getBlockedUsers: async (): Promise<BlockedUserItem[]> => {
    const response = await apiClient.get<BlockedUserItem[]>('/api/blocks');
    return response.data;
  },

  checkBlockStatus: async (userId: string): Promise<BlockStatusResponse> => {
    try {
      const response = await apiClient.get<any>(`/api/blocks/${userId}`);
      const data = response.data;
      return {
        isBlocked: Boolean(data?.isBlocked || data?.blockedByMe),
        isBlockedBy: Boolean(data?.isBlockedBy || data?.hasBlockedYou || data?.blockedYou || data?.blockedBy),
      };
    } catch {
      return { isBlocked: false, isBlockedBy: false };
    }
  },
};
