import { create } from 'zustand';
import type { BlockedUserItem } from '../types/block';
import { blockService } from '../services/blockService';
import { getUserCookie } from '../utils/authCookie';

interface BlockState {
  blockedUsers: BlockedUserItem[];
  blockedUserIds: string[];
  blockedByUserIdSet: string[];
  isLoading: boolean;
  error: string | null;

  fetchBlockedUsers: () => Promise<void>;
  blockUser: (userId: string) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;
  isBlocked: (userId: string) => boolean;
  isBlockedBy: (userId: string) => boolean;
  handleUserBlockedEvent: (payload: { blockerId: string; blockedId: string }) => void;
  handleUserUnblockedEvent: (payload: { blockerId: string; blockedId: string }) => void;
}

export const useBlockStore = create<BlockState>((set, get) => ({
  blockedUsers: [],
  blockedUserIds: [],
  blockedByUserIdSet: [],
  isLoading: false,
  error: null,

  fetchBlockedUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await blockService.getBlockedUsers();
      const rawList = Array.isArray(list) ? list : [];
      const currentUser = getUserCookie();
      const currentUserId = currentUser?.id;

      const ids = rawList
        .filter((item: any) => !item.blockerId || !currentUserId || item.blockerId === currentUserId)
        .map((item: any) => item.blockedId || item.blocked?.id)
        .filter(Boolean);

      set({ blockedUsers: rawList, blockedUserIds: ids, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load blocked users', isLoading: false });
    }
  },

  blockUser: async (userId: string) => {
    try {
      const res = await blockService.blockUser(userId);
      if (res) {
        await get().fetchBlockedUsers();
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.message || 'Failed to block user' });
      return false;
    }
  },

  unblockUser: async (userId: string) => {
    try {
      await blockService.unblockUser(userId);
      set((state) => ({
        blockedUsers: state.blockedUsers.filter((item) => item.blockedId !== userId),
        blockedUserIds: state.blockedUserIds.filter((id) => id !== userId),
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to unblock user' });
      return false;
    }
  },

  isBlocked: (userId: string) => {
    return get().blockedUserIds.includes(userId);
  },

  isBlockedBy: (userId: string) => {
    return get().blockedByUserIdSet.includes(userId);
  },

  handleUserBlockedEvent: ({ blockerId, blockedId }: { blockerId: string; blockedId: string }) => {
    const currentUser = getUserCookie();
    const myId = currentUser?.id;

    if (myId && blockerId === myId) {
      set((state) => ({
        blockedUserIds: state.blockedUserIds.includes(blockedId)
          ? state.blockedUserIds
          : [...state.blockedUserIds, blockedId],
      }));
    } else if (myId && blockedId === myId) {
      set((state) => ({
        blockedByUserIdSet: state.blockedByUserIdSet.includes(blockerId)
          ? state.blockedByUserIdSet
          : [...state.blockedByUserIdSet, blockerId],
      }));
    }
  },

  handleUserUnblockedEvent: ({ blockerId, blockedId }: { blockerId: string; blockedId: string }) => {
    const currentUser = getUserCookie();
    const myId = currentUser?.id;

    if (myId && blockerId === myId) {
      set((state) => ({
        blockedUserIds: state.blockedUserIds.filter((id) => id !== blockedId),
      }));
    } else if (myId && blockedId === myId) {
      set((state) => ({
        blockedByUserIdSet: state.blockedByUserIdSet.filter((id) => id !== blockerId),
      }));
    }
  },
}));
