import { useEffect } from 'react';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../store/useAuthStore';
import { useBlockStore } from '../store/useBlockStore';
import { useStoryStore } from '../store/useStoryStore';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import type { Message } from '../types/chat';
import type { Notification } from '../types/notification';

export const useSocket = () => {
  const { isAuthenticated, user } = useAuthStore();
  const handleUserBlockedEvent = useBlockStore((s) => s.handleUserBlockedEvent);
  const handleUserUnblockedEvent = useBlockStore((s) => s.handleUserUnblockedEvent);
  const filterUserStories = useStoryStore((s) => s.filterUserStories);
  const handleUserBlockedChat = useChatStore((s) => s.handleUserBlocked);
  const appendIncomingMessage = useChatStore((s) => s.appendIncomingMessage);
  const handleConversationRead = useChatStore((s) => s.handleConversationRead);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addToast = useNotificationStore((s) => s.addToast);
  const setNewPostAvailable = useNotificationStore((s) => s.setNewPostAvailable);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketService.disconnect();
      return;
    }

    const socket = socketService.connect();
    if (!socket) return;

    const onUserBlocked = (data: { blockerId: string; blockedId?: string }) => {
      const bId = data.blockerId;
      const targetId = data.blockerId === user.id ? data.blockedId : data.blockerId;
      if (targetId) {
        handleUserBlockedEvent({ blockerId: bId, blockedId: data.blockedId || targetId });
        filterUserStories(targetId);
        handleUserBlockedChat(targetId);
      }
    };

    const onUserUnblocked = (data: { blockerId: string; blockedId?: string }) => {
      const bId = data.blockerId;
      const targetId = data.blockerId === user.id ? data.blockedId : data.blockerId;
      if (targetId) {
        handleUserUnblockedEvent({ blockerId: bId, blockedId: data.blockedId || targetId });
      }
    };

    const onAccountPrivacyUpdated = (_data: { userId: string; isPrivate: boolean }) => {};

    const onNewPostAvailable = (_data: any) => {
      setNewPostAvailable(true, true);
    };

    const onNewMessage = (message: Message) => {
      if (message.senderId !== user.id) {
        appendIncomingMessage(message);
      }
    };

    const onConversationRead = (data: { conversationId: string; readerId: string }) => {
      handleConversationRead(data);
    };

    const onNewNotification = (notification: Notification) => {
      if (notification.userId === user.id) {
        addNotification(notification);
      }
    };

    const onStoryCreated = (_data: any) => {
      useStoryStore.getState().fetchStories();
    };

    const onStoryViewed = (data: { storyId: string; viewer: any; viewsCount: number }) => {
      useStoryStore.getState().handleStoryViewed(data);

      window.dispatchEvent(new CustomEvent('story_viewed_live', { detail: data }));
    };

    const onStoryDeleted = (data: { storyId: string }) => {
      useStoryStore.getState().handleStoryDeleted(data.storyId);
    };

    socketService.on('user_blocked', onUserBlocked);
    socketService.on('user_unblocked', onUserUnblocked);
    socketService.on('account_privacy_updated', onAccountPrivacyUpdated);
    socketService.on('new_post_available', onNewPostAvailable);
    socketService.on('new_message', onNewMessage);
    socketService.on('conversation_read', onConversationRead);
    socketService.on('new_notification', onNewNotification);
    socketService.on('story_created', onStoryCreated);
    socketService.on('story_viewed', onStoryViewed);
    socketService.on('story_deleted', onStoryDeleted);

    return () => {
      socketService.off('user_blocked', onUserBlocked);
      socketService.off('user_unblocked', onUserUnblocked);
      socketService.off('account_privacy_updated', onAccountPrivacyUpdated);
      socketService.off('new_post_available', onNewPostAvailable);
      socketService.off('new_message', onNewMessage);
      socketService.off('conversation_read', onConversationRead);
      socketService.off('new_notification', onNewNotification);
      socketService.off('story_created', onStoryCreated);
      socketService.off('story_viewed', onStoryViewed);
      socketService.off('story_deleted', onStoryDeleted);
    };
  }, [
    isAuthenticated,
    user,
    handleUserBlockedEvent,
    handleUserUnblockedEvent,
    filterUserStories,
    handleUserBlockedChat,
    appendIncomingMessage,
    handleConversationRead,
    addNotification,
    addToast,
    setNewPostAvailable,
  ]);
};
