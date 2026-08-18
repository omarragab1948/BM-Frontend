import { apiClient } from './apiClient';
import type { Comment, CreateCommentDTO } from '../types/comment';
import type { PaginatedResponse } from '../types/user';

export const commentService = {
  async addComment(postId: string, dto: CreateCommentDTO): Promise<Comment> {
    const response = await apiClient.post<Comment>(`/api/posts/${postId}/comments`, dto);
    return response.data;
  },

  async getPostComments(postId: string, page = 1, limit = 20): Promise<PaginatedResponse<Comment>> {
    const response = await apiClient.get<{
      data: Comment[];
      meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    }>(`/api/posts/${postId}/comments`, {
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

  async deleteComment(postId: string, commentId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/posts/${postId}/comments/${commentId}`);
    return response.data;
  },
};
