import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { Send, Image as ImageIcon, MoreVertical, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Message } from '../../types/chat';
import type { User } from '../../types/user';
import { useAuthStore } from '../../store/useAuthStore';
import { useBlockStore } from '../../store/useBlockStore';
import { blockService } from '../../services/blockService';
import { useNavigate } from 'react-router-dom';

interface Props {
  recipient: User | null;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, mediaUrl?: string) => Promise<boolean>;
  onBackMobile?: () => void;
}

const messageSchema = z
  .object({
    content: z.string().optional(),
    mediaUrl: z.string().optional(),
  })
  .refine(
    (data) => Boolean((data.content && data.content.trim().length > 0) || (data.mediaUrl && data.mediaUrl.trim().length > 0)),
    {
      message: 'Message cannot be empty',
      path: ['content'],
    }
  );

type MessageFormData = z.infer<typeof messageSchema>;

export const ChatThread: React.FC<Props> = ({
  recipient,
  messages,
  isLoading,
  onSendMessage,
  onBackMobile,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { blockUser, unblockUser, isBlocked, isBlockedBy, blockedUserIds, blockedByUserIdSet } = useBlockStore();

  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
      mediaUrl: '',
    },
  });

  const contentValue = watch('content') || '';
  const mediaUrlValue = watch('mediaUrl') || '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [isBlockedByTarget, setIsBlockedByTarget] = useState(false);

  useEffect(() => {
    if (!recipient?.id) return;
    if (isBlockedBy(recipient.id)) {
      setIsBlockedByTarget(true);
      return;
    }
    blockService
      .checkBlockStatus(recipient.id)
      .then((res) => {
        setIsBlockedByTarget(Boolean(res.isBlockedBy));
      })
      .catch(() => {
        setIsBlockedByTarget(false);
      });
  }, [recipient?.id, blockedUserIds, blockedByUserIdSet]);

  const isUserBlockedCurrent = recipient ? isBlocked(recipient.id) : false;

  const onSubmit = async (data: MessageFormData) => {
    if (isSending) return;

    setIsSending(true);
    setSendError(null);

    const success = await onSendMessage(data.content?.trim() || '', data.mediaUrl?.trim() || undefined);
    setIsSending(false);

    if (success) {
      reset();
      setShowMediaInput(false);
    } else {
      setSendError('Cannot send message. User may be unavailable or blocked.');
    }
  };

  const handleBlockUser = async () => {
    setMenuAnchor(null);
    if (recipient) {
      if (isUserBlockedCurrent) {
        await unblockUser(recipient.id);
      } else {
        await blockUser(recipient.id);
      }
    }
  };

  const isSelf = Boolean(currentUser?.id && recipient?.id && currentUser.id === recipient.id);
  const canSubmit = Boolean(contentValue.trim() || mediaUrlValue.trim()) && !isSending;

  if (!recipient) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#71717a',
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: '#f4f4f5', mb: 1 }}>
          Your Messages
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Select a conversation from the list to start messaging.
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#09090b' }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: '#18181b',
          borderBottom: '1px solid #27272a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {onBackMobile && (
            <IconButton onClick={onBackMobile} sx={{ color: '#f4f4f5', display: { xs: 'flex', md: 'none' } }}>
              <ArrowLeft size={20} />
            </IconButton>
          )}

          <Avatar
            src={recipient.avatarUrl}
            alt={recipient.username}
            onClick={() => navigate(`/profile/${recipient.username}`)}
            sx={{ width: 40, height: 40, cursor: 'pointer', bgcolor: '#0095f6' }}
          >
            {recipient.username.charAt(0).toUpperCase()}
          </Avatar>

          <Box
            onClick={() => navigate(`/profile/${recipient.username}`)}
            sx={{ cursor: 'pointer' }}
          >
            <Typography variant="subtitle2" sx={{ color: '#f4f4f5', fontWeight: 600 }}>
              {recipient.username}
            </Typography>
            {recipient.bio && (
              <Typography variant="caption" sx={{ color: '#a1a1aa', display: 'block' }}>
                {recipient.bio}
              </Typography>
            )}
          </Box>
        </Box>

        {!isSelf && (
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: '#a1a1aa' }}>
            <MoreVertical size={20} />
          </IconButton>
        )}

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                bgcolor: '#18181b',
                color: '#f4f4f5',
                border: '1px solid #27272a',
                borderRadius: 2,
              },
            },
          }}
        >
          <MenuItem onClick={handleBlockUser} sx={{ color: isUserBlockedCurrent ? '#22c55e' : '#ef4444' }}>
            <ListItemIcon>
              <ShieldAlert size={18} color={isUserBlockedCurrent ? '#22c55e' : '#ef4444'} />
            </ListItemIcon>
            {isUserBlockedCurrent ? 'Unblock User' : 'Block User'}
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} sx={{ color: '#0095f6' }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: '#71717a' }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              No messages yet
            </Typography>
            <Typography variant="caption">Send a message to start conversation with {recipient.username}</Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: isMe ? '#0095f6' : '#18181b',
                    color: '#ffffff',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: isMe ? 'none' : '1px solid #27272a',
                  }}
                >
                  {msg.mediaUrl && (
                    <Box
                      component="img"
                      src={msg.mediaUrl}
                      alt="Attachment"
                      sx={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 2, mb: msg.content ? 1 : 0 }}
                    />
                  )}
                  {msg.content && (
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7, fontSize: '10px', mt: 0.5 }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {isBlockedByTarget ? (
        <Box sx={{ p: 2, bgcolor: '#18181b', borderTop: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
          <ShieldAlert size={20} color="#ef4444" />
          <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600 }}>
            This user has blocked you. You cannot reply or send messages to this account.
          </Typography>
        </Box>
      ) : isUserBlockedCurrent ? (
        <Box sx={{ p: 2, px: 3, bgcolor: '#18181b', borderTop: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShieldAlert size={20} color="#ef4444" />
            <Typography variant="body2" sx={{ color: '#f4f4f5', fontWeight: 600 }}>
              You have blocked this user. Unblock to send messages.
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            onClick={async () => {
              if (recipient) await unblockUser(recipient.id);
            }}
            sx={{ bgcolor: '#22c55e', color: '#ffffff', textTransform: 'none', fontWeight: 700, px: 2.5, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#16a34a' } }}
          >
            Unblock
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2, bgcolor: '#18181b', borderTop: '1px solid #27272a' }}>
          {showMediaInput && (
            <TextField
              size="small"
              fullWidth
              placeholder="Paste Image URL..."
              {...register('mediaUrl')}
              error={Boolean(errors.mediaUrl)}
              sx={{
                mb: 1.5,
                '& .MuiInputBase-root': { bgcolor: '#09090b', color: '#f4f4f5', fontSize: '13px' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3f3f46' },
              }}
            />
          )}

          {sendError && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mb: 1 }}>
              {sendError}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              type="button"
              onClick={() => setShowMediaInput((prev) => !prev)}
              sx={{ color: showMediaInput ? '#0095f6' : '#a1a1aa' }}
            >
              <ImageIcon size={20} />
            </IconButton>

            <TextField
              fullWidth
              size="small"
              placeholder="Message..."
              {...register('content')}
              error={Boolean(errors.content)}
              sx={{
                '& .MuiInputBase-root': { bgcolor: '#09090b', color: '#f4f4f5', borderRadius: 4 },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#27272a' },
              }}
            />

            <IconButton
              type="submit"
              disabled={!canSubmit}
              sx={{
                bgcolor: '#0095f6',
                color: '#ffffff',
                '&:hover': { bgcolor: '#1877f2' },
                '&.Mui-disabled': { bgcolor: '#27272a', color: '#71717a' },
              }}
            >
              <Send size={18} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

