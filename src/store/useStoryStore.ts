import { create } from 'zustand';
import type { StoryFeedGroup, CreateStoryDTO } from '../types/story';
import { storyService } from '../services/storyService';

interface StoryState {
  storiesFeed: StoryFeedGroup[];
  activeGroupIndex: number | null;
  activeStoryIndex: number | null;
  isViewerOpen: boolean;
  isLoading: boolean;
  error: string | null;

  fetchStories: () => Promise<void>;
  openViewer: (groupIndex: number, storyIndex?: number) => void;
  closeViewer: () => void;
  nextStory: () => void;
  prevStory: () => void;
  markCurrentStoryViewed: () => Promise<void>;
  createStory: (dto: CreateStoryDTO) => Promise<boolean>;
  deleteStory: (storyId: string) => Promise<boolean>;
  filterUserStories: (userId: string) => void;
  handleStoryViewed: (data: { storyId: string; viewsCount: number }) => void;
  handleStoryDeleted: (storyId: string) => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  storiesFeed: [],
  activeGroupIndex: null,
  activeStoryIndex: null,
  isViewerOpen: false,
  isLoading: false,
  error: null,

  fetchStories: async () => {
    set({ isLoading: true, error: null });
    try {
      const feed = await storyService.getStoriesFeed();
      set({ storiesFeed: feed, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load stories', isLoading: false });
    }
  },

  openViewer: (groupIndex: number, storyIndex = 0) => {
    set({
      activeGroupIndex: groupIndex,
      activeStoryIndex: storyIndex,
      isViewerOpen: true,
    });
    get().markCurrentStoryViewed();
  },

  closeViewer: () => {
    set({
      activeGroupIndex: null,
      activeStoryIndex: null,
      isViewerOpen: false,
    });
  },

  nextStory: () => {
    const { storiesFeed, activeGroupIndex, activeStoryIndex } = get();
    if (activeGroupIndex === null || activeStoryIndex === null) return;

    const currentGroup = storiesFeed[activeGroupIndex];
    if (!currentGroup) return;

    if (activeStoryIndex < currentGroup.stories.length - 1) {
      set({ activeStoryIndex: activeStoryIndex + 1 });
      get().markCurrentStoryViewed();
    } else if (activeGroupIndex < storiesFeed.length - 1) {
      set({ activeGroupIndex: activeGroupIndex + 1, activeStoryIndex: 0 });
      get().markCurrentStoryViewed();
    } else {
      get().closeViewer();
    }
  },

  prevStory: () => {
    const { storiesFeed, activeGroupIndex, activeStoryIndex } = get();
    if (activeGroupIndex === null || activeStoryIndex === null) return;

    if (activeStoryIndex > 0) {
      set({ activeStoryIndex: activeStoryIndex - 1 });
    } else if (activeGroupIndex > 0) {
      const prevGroup = storiesFeed[activeGroupIndex - 1];
      set({ activeGroupIndex: activeGroupIndex - 1, activeStoryIndex: prevGroup.stories.length - 1 });
    }
  },

  markCurrentStoryViewed: async () => {
    const { storiesFeed, activeGroupIndex, activeStoryIndex } = get();
    if (activeGroupIndex === null || activeStoryIndex === null) return;

    const currentGroup = storiesFeed[activeGroupIndex];
    if (!currentGroup) return;
    const currentStory = currentGroup.stories[activeStoryIndex];
    if (!currentStory || currentStory.isViewed) return;

    try {
      await storyService.viewStory(currentStory.id);
      set((state) => {
        const newFeed = [...state.storiesFeed];
        const group = { ...newFeed[activeGroupIndex] };
        const stories = [...group.stories];
        stories[activeStoryIndex] = { ...stories[activeStoryIndex], isViewed: true };

        const allViewed = stories.every((s) => s.isViewed);
        newFeed[activeGroupIndex] = { ...group, stories, allViewed };

        return { storiesFeed: newFeed };
      });
    } catch {}
  },

  createStory: async (dto: CreateStoryDTO) => {
    try {
      await storyService.createStory(dto);
      await get().fetchStories();
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to post story' });
      return false;
    }
  },

  deleteStory: async (storyId: string) => {
    try {
      await storyService.deleteStory(storyId);
      get().handleStoryDeleted(storyId);
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete story' });
      return false;
    }
  },

  filterUserStories: (userId: string) => {
    set((state) => {
      const filtered = state.storiesFeed.filter((item) => item.user.id !== userId);
      const isViewerAffected =
        state.isViewerOpen &&
        state.activeGroupIndex !== null &&
        state.storiesFeed[state.activeGroupIndex]?.user.id === userId;

      return {
        storiesFeed: filtered,
        ...(isViewerAffected ? { isViewerOpen: false, activeGroupIndex: null, activeStoryIndex: null } : {}),
      };
    });
  },

  handleStoryViewed: ({ storyId, viewsCount }: { storyId: string; viewsCount: number }) => {
    set((state) => {
      const newFeed = state.storiesFeed.map((group) => ({
        ...group,
        stories: group.stories.map((s) => (s.id === storyId ? { ...s, viewsCount } : s)),
      }));
      return { storiesFeed: newFeed };
    });
  },

  handleStoryDeleted: (storyId: string) => {
    set((state) => {
      const newFeed = state.storiesFeed
        .map((group) => ({
          ...group,
          stories: group.stories.filter((s) => s.id !== storyId),
        }))
        .filter((group) => group.stories.length > 0);

      const isCurrentStoryDeleted =
        state.isViewerOpen &&
        state.activeGroupIndex !== null &&
        state.activeStoryIndex !== null &&
        state.storiesFeed[state.activeGroupIndex]?.stories[state.activeStoryIndex]?.id === storyId;

      return {
        storiesFeed: newFeed,
        ...(isCurrentStoryDeleted ? { isViewerOpen: false, activeGroupIndex: null, activeStoryIndex: null } : {}),
      };
    });
  },
}));
