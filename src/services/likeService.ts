import { apiClient } from './apiClient';
import type { FollowUser } from '../types/follow';
import type { PaginatedResponse, User } from '../types/user';

export const likeService = {
  async likePost(postId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/api/posts/${postId}/likes`);
    return response.data;
  },

  async unlikePost(postId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/posts/${postId}/likes`);
    return response.data;
  },

  async getPostLikes(postId: string, page = 1, limit = 10): Promise<PaginatedResponse<FollowUser>> {
    const response = await apiClient.get<{
      data: User[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }>(`/api/posts/${postId}/likes`, {
      params: { page, limit },
    });

    const likedUsers: FollowUser[] = response.data.data.map((u) => ({
      id: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      isPrivate: u.isPrivate,
      status: 'NONE',
    }));

    return {
      data: likedUsers,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      hasMore: response.data.meta.hasNextPage,
    };
  },
};
