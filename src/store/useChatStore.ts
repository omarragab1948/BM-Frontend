import { create } from 'zustand';
import type { Conversation, Message, SendMessageDTO } from '../types/chat';
import type { User } from '../types/user';
import { chatService } from '../services/chatService';

interface ChatState {
  conversations: Conversation[];
  activeRecipientId: string | null;
  messagesMap: Record<string, Message[]>;
  unreadTotal: number;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  fetchMessages: (recipientId: string) => Promise<void>;
  setActiveRecipientId: (recipientId: string | null) => void;
  startConversationWithUser: (user: Partial<User> & { id: string; username: string }) => void;
  sendMessage: (dto: SendMessageDTO) => Promise<boolean>;
  appendIncomingMessage: (message: Message) => void;
  handleConversationRead: (data: { conversationId: string; readerId: string }) => void;
  handleUserBlocked: (blockerId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeRecipientId: null,
  messagesMap: {},
  unreadTotal: 0,
  isLoadingConversations: false,
  isLoadingMessages: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoadingConversations: true, error: null });
    try {
      const convs = await chatService.getConversations();
      set((state) => {
        const backendParticipantIds = new Set(
          (convs || []).map((c) => c?.participant?.id).filter(Boolean)
        );
        const draftConvs = (state.conversations || []).filter(
          (c) => c?.participant?.id && !backendParticipantIds.has(c.participant.id)
        );
        const mergedConvs = [...draftConvs, ...(convs || [])];
        const unread = mergedConvs.reduce((acc, c) => acc + (c?.unreadCount || 0), 0);
        return {
          conversations: mergedConvs,
          unreadTotal: unread,
          isLoadingConversations: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch conversations', isLoadingConversations: false });
    }
  },

  fetchMessages: async (recipientId: string) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const msgs = await chatService.getMessages(recipientId);
      set((state) => ({
        messagesMap: { ...state.messagesMap, [recipientId]: msgs },
        isLoadingMessages: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to load messages', isLoadingMessages: false });
    }
  },

  setActiveRecipientId: (recipientId: string | null) => {
    set({ activeRecipientId: recipientId });
    if (recipientId) {
      get().fetchMessages(recipientId);
      set((state) => {
        const convs = (state.conversations || []).map((c) =>
          c?.participant?.id === recipientId ? { ...c, unreadCount: 0 } : c
        );
        const unread = convs.reduce((acc, c) => acc + (c?.unreadCount || 0), 0);
        return { conversations: convs, unreadTotal: unread };
      });
    }
  },

  startConversationWithUser: (user) => {
    if (!user || !user.id) return;
    const { conversations } = get();
    const existing = (conversations || []).find((c) => c?.participant?.id === user.id);

    if (!existing) {
      const newConv: Conversation = {
        id: `conv-${user.id}`,
        participant: {
          id: user.id,
          username: user.username || 'User',
          email: user.email || '',
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          isPrivate: user.isPrivate,
          createdAt: user.createdAt || new Date().toISOString(),
        },
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      set({ conversations: [newConv, ...conversations] });
    } else {
      set({
        conversations: conversations.map((c) =>
          c?.participant?.id === user.id
            ? {
                ...c,
                participant: {
                  ...c.participant,
                  username: user.username || c.participant.username,
                  avatarUrl: user.avatarUrl !== undefined ? user.avatarUrl : c.participant.avatarUrl,
                  bio: user.bio !== undefined ? user.bio : c.participant.bio,
                },
              }
            : c
        ),
      });
    }

    get().setActiveRecipientId(user.id);
  },

  sendMessage: async (dto: SendMessageDTO) => {
    try {
      const msg = await chatService.sendMessage(dto);
      const recipientId = dto.recipientId;

      set((state) => {
        const currentMsgs = state.messagesMap[recipientId] || [];
        const updatedMsgs = [...currentMsgs, msg];

        const existingIdx = state.conversations.findIndex((c) => c.participant.id === recipientId);
        let updatedConvs = [...state.conversations];

        if (existingIdx >= 0) {
          updatedConvs = updatedConvs.map((c) =>
            c.participant.id === recipientId
              ? { ...c, lastMessage: msg, updatedAt: msg.createdAt }
              : c
          );
        }

        return {
          messagesMap: { ...state.messagesMap, [recipientId]: updatedMsgs },
          conversations: updatedConvs,
        };
      });

      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to send message' });
      return false;
    }
  },

  appendIncomingMessage: (message: Message) => {
    const { activeRecipientId, messagesMap, conversations } = get();
    const senderId = message.senderId;

    if (activeRecipientId === senderId) {
      const currentMsgs = messagesMap[senderId] || [];
      const updatedMsgs = [...currentMsgs, message];
      set({
        messagesMap: { ...messagesMap, [senderId]: updatedMsgs },
      });
      chatService.markAsRead(message.id).catch(() => {});
    } else {
      set((state) => ({
        unreadTotal: state.unreadTotal + 1,
      }));
    }

    const existingConvIndex = conversations.findIndex((c) => c.participant.id === senderId);
    if (existingConvIndex >= 0) {
      const updatedConvs = conversations.map((c) =>
        c.participant.id === senderId
          ? {
              ...c,
              lastMessage: message,
              unreadCount: activeRecipientId === senderId ? 0 : c.unreadCount + 1,
              updatedAt: message.createdAt,
            }
          : c
      );
      set({ conversations: updatedConvs });
    } else {
      get().fetchConversations();
    }
  },

  handleConversationRead: ({ readerId }: { conversationId: string; readerId: string }) => {
    const { messagesMap, conversations } = get();
    const updatedMap = { ...messagesMap };

    if (updatedMap[readerId]) {
      updatedMap[readerId] = updatedMap[readerId].map((m) => ({
        ...m,
        isRead: true,
      }));
    }

    const updatedConvs = conversations.map((c) =>
      c.participant.id === readerId
        ? {
            ...c,
            lastMessage: c.lastMessage ? { ...c.lastMessage, isRead: true } : c.lastMessage,
          }
        : c
    );

    set({ messagesMap: updatedMap, conversations: updatedConvs });
  },

  handleUserBlocked: (blockerId: string) => {
    const { activeRecipientId } = get();
    set((state) => ({
      conversations: state.conversations.filter((c) => c.participant?.id !== blockerId),
      ...(activeRecipientId === blockerId ? { activeRecipientId: null } : {}),
    }));
  },
}));

