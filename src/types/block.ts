export interface BlockedUserItem {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
  blocked: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface BlockActionResponse {
  message: string;
  block?: {
    id: string;
    blockerId: string;
    blockedId: string;
    createdAt: string;
  };
}

export interface BlockStatusResponse {
  isBlocked: boolean;
  isBlockedBy?: boolean;
}
