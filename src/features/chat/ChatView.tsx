import React, { useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { ConversationList } from './ConversationList';
import { ChatThread } from './ChatThread';
import { useChatStore } from '../../store/useChatStore';

export const ChatView: React.FC = () => {
  const {
    conversations,
    activeRecipientId,
    messagesMap,
    isLoadingConversations,
    isLoadingMessages,
    fetchConversations,
    setActiveRecipientId,
    sendMessage,
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const activeConv = (conversations || []).find((c) => c?.participant?.id === activeRecipientId);
  const activeRecipient = activeConv ? activeConv.participant : null;
  const activeMessages = activeRecipientId ? messagesMap[activeRecipientId] || [] : [];

  const handleSelectConversation = (recipientId: string) => {
    setActiveRecipientId(recipientId);
  };

  const handleSendMessage = async (content: string, mediaUrl?: string) => {
    if (!activeRecipientId) return false;
    return await sendMessage({ recipientId: activeRecipientId, content, mediaUrl });
  };

  return (
    <Paper
      sx={{
        height: 'calc(100vh - 48px)',
        maxHeight: '840px',
        bgcolor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: '340px' },
          display: { xs: activeRecipientId ? 'none' : 'block', md: 'block' },
          height: '100%',
        }}
      >
        <ConversationList
          conversations={conversations}
          activeRecipientId={activeRecipientId}
          onSelectConversation={handleSelectConversation}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: { xs: activeRecipientId ? 'block' : 'none', md: 'block' },
          height: '100%',
        }}
      >
        <ChatThread
          recipient={activeRecipient}
          messages={activeMessages}
          isLoading={isLoadingMessages || isLoadingConversations}
          onSendMessage={handleSendMessage}
          onBackMobile={() => setActiveRecipientId(null)}
        />
      </Box>
    </Paper>
  );
};
