export type FollowStatus = 'NONE' | 'PENDING' | 'ACCEPTED';

export interface FollowUser {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isPrivate?: boolean;
  status?: FollowStatus;
}
