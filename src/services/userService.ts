import { apiClient } from "./apiClient";
import type {
  User,
  UserProfile,
  ChangePasswordDTO,
  PaginatedResponse,
} from "../types/user";

export interface UpdateProfilePayload {
  username?: string;
  bio?: string;
  isPrivate?: boolean;
  avatarFile?: File | null;
  avatarUrl?: string;
}

export const userService = {
  async searchUsers(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<User>> {
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
    }>("/api/users/search", {
      params: { q: query, page, limit },
    });

    return {
      data: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      hasMore: response.data.meta.hasNextPage,
    };
  },

  async getUserProfile(username: string): Promise<UserProfile> {
    const response = await apiClient.get<{
      user: {
        id: string;
        username: string;
        email?: string;
        bio?: string;
        avatarUrl?: string;
        isPrivate?: boolean;
        createdAt?: string;
        followersCount: number;
        followingCount: number;
        postsCount: number;
      };
      isSelf: boolean;
      isFollowing: boolean;
      followStatus: "ACCEPTED" | "PENDING" | null;
      canAccessPosts: boolean;
    }>(`/api/users/profile/${username}`);

    const data = response.data;

    return {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email || "",
      bio: data.user.bio,
      avatarUrl: data.user.avatarUrl,
      isPrivate: data.user.isPrivate,
      createdAt: data.user.createdAt || new Date().toISOString(),
      followersCount: data.user.followersCount || 0,
      followingCount: data.user.followingCount || 0,
      postsCount: data.user.postsCount || 0,
      isSelf: data.isSelf,
      isFollowing: data.isFollowing || data.followStatus === "ACCEPTED",
      isPendingFollow: data.followStatus === "PENDING",
    };
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const formData = new FormData();
    if (payload.username !== undefined)
      formData.append("username", payload.username);
    if (payload.bio !== undefined) formData.append("bio", payload.bio);
    if (payload.isPrivate !== undefined)
      formData.append("isPrivate", String(payload.isPrivate));
    if (payload.avatarFile) formData.append("avatar", payload.avatarFile);
    console.log(formData.get("isPrivate"));
    const response = await apiClient.patch<User>(
      "/api/users/profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  async changePassword(dto: ChangePasswordDTO): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/api/users/change-password",
      dto,
    );
    return response.data;
  },
};
