import { apiClient } from './apiClient';
import type { Post, CreatePostDTO } from '../types/post';
import type { PaginatedResponse } from '../types/user';

export const postService = {
  async createPost(dto: CreatePostDTO): Promise<Post> {
    const formData = new FormData();
    if (dto.description) {
      formData.append('description', dto.description);
    }

    if (dto.files && dto.files.length > 0) {
      dto.files.forEach((file) => {
        formData.append('media', file);
      });
    }

    const response = await apiClient.post<Post>('/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getFeed(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    const response = await apiClient.get<{
      data: Post[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }>('/api/posts/feed', {
      params: { page, limit },
    });

    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      hasMore: response.data.meta.hasNextPage,
    };
  },

  async getUserPosts(username: string, page = 1, limit = 12): Promise<PaginatedResponse<Post>> {
    const response = await apiClient.get<{
      data: Post[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }>(`/api/posts/user/${username}`, {
      params: { page, limit },
    });

    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      hasMore: response.data.meta.hasNextPage,
    };
  },

  async getPostById(id: string): Promise<Post> {
    const response = await apiClient.get<Post>(`/api/posts/${id}`);
    return response.data;
  },

  async deletePost(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/posts/${id}`);
    return response.data;
  },
};
