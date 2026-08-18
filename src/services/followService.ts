import { apiClient } from "./apiClient";
import type { FollowUser, FollowStatus } from "../types/follow";
import type { PaginatedResponse } from "../types/user";

export const followService = {
  async followUser(userId: string): Promise<{ status: FollowStatus }> {
    const response = await apiClient.post<{
      message: string;
      follow?: { status: FollowStatus };
    }>(`/api/follows/${userId}`);

    const status = response.data.follow?.status || "ACCEPTED";
    return { status };
  },

  async unfollowUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/api/follows/${userId}`,
    );
    return response.data;
  },

  async acceptFollowRequest(followerId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/api/follows/${followerId}/accept`,
    );
    return response.data;
  },

  async rejectFollowRequest(followerId: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `/api/follows/${followerId}/reject`,
    );
    return response.data;
  },

  async getFollowers(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<FollowUser>> {
    try {
      const response = await apiClient.get<any>(`/api/follows/${userId}/followers`, {
        params: { page, limit },
      });

      const resData = response.data;
      const rawList: any[] = Array.isArray(resData)
        ? resData
        : Array.isArray(resData?.data)
        ? resData.data
        : [];

      const followerUsers: FollowUser[] = rawList.map((item: any) => {
        const u = item.follower || item.user || item;
        return {
          id: u.id || item.id || String(Math.random()),
          username: u.username || 'User',
          avatarUrl: u.avatarUrl || u.avatar,
          bio: u.bio,
          isPrivate: u.isPrivate,
          status: "ACCEPTED" as FollowStatus,
        };
      });

      return {
        data: followerUsers,
        total: resData?.meta?.total ?? followerUsers.length,
        page: resData?.meta?.page ?? page,
        limit: resData?.meta?.limit ?? limit,
        hasMore: resData?.meta?.hasNextPage ?? false,
      };
    } catch {
      return {
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }
  },

  async getFollowing(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<FollowUser>> {
    try {
      const response = await apiClient.get<any>(`/api/follows/${userId}/following`, {
        params: { page, limit },
      });

      const resData = response.data;
      const rawList: any[] = Array.isArray(resData)
        ? resData
        : Array.isArray(resData?.data)
        ? resData.data
        : [];

      const followingUsers: FollowUser[] = rawList.map((item: any) => {
        const u = item.following || item.user || item;
        return {
          id: u.id || item.id || String(Math.random()),
          username: u.username || 'User',
          avatarUrl: u.avatarUrl || u.avatar,
          bio: u.bio,
          isPrivate: u.isPrivate,
          status: "ACCEPTED" as FollowStatus,
        };
      });

      return {
        data: followingUsers,
        total: resData?.meta?.total ?? followingUsers.length,
        page: resData?.meta?.page ?? page,
        limit: resData?.meta?.limit ?? limit,
        hasMore: resData?.meta?.hasNextPage ?? false,
      };
    } catch {
      return {
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }
  },
  async getPendingRequests(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<FollowUser>> {
    try {
      const response = await apiClient.get<any>("/api/follows/pending", {
        params: { page, limit },
      });

      const resData = response.data;
      const rawList = Array.isArray(resData)
        ? resData
        : Array.isArray(resData?.data)
          ? resData.data
          : [];

      const pendingUsers: FollowUser[] = rawList.map((item: any) => {
        const u = item.follower || item.user || item.requester || item;
        return {
          id: u.id || item.id || String(Math.random()),
          username: u.username || 'User',
          avatarUrl: u.avatarUrl || u.avatar,
          bio: u.bio,
          isPrivate: u.isPrivate,
          status: "PENDING" as FollowStatus,
        };
      });

      return {
        data: pendingUsers,
        total: resData?.meta?.total ?? pendingUsers.length,
        page: resData?.meta?.page ?? page,
        limit: resData?.meta?.limit ?? limit,
        hasMore: resData?.meta?.hasNextPage ?? false,
      };
    } catch {
      return {
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }
  },
};
