export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isPrivate?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  isPendingFollow?: boolean;
  isSelf?: boolean;
}

export interface UpdateProfileDTO {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  isPrivate?: boolean;
}

export interface ChangePasswordDTO {
  currentPassword?: string;
  newPassword?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
