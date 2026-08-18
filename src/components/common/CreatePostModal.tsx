import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import { X, Trash2, Upload, Image as ImageIcon, Video } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { postService } from '../../services/postService';
import type { Post, MediaType } from '../../types/post';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPostCreated?: (newPost: Post) => void;
}

interface MediaItemInput {
  file: File;
  url: string;
  type: MediaType;
}

const createPostSchema = z.object({
  description: z.string().optional(),
  mediaList: z
    .array(
      z.object({
        file: z.instanceof(File),
        url: z.string(),
        type: z.enum(['IMAGE', 'VIDEO']),
      })
    )
    .min(1, 'Please select at least one image or video from your device'),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ open, onClose, onPostCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      description: '',
      mediaList: [],
    },
  });

  const mediaList = watch('mediaList') || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newItems: MediaItemInput[] = [];
    let loadedCount = 0;

    fileArray.forEach((file) => {
      const type: MediaType = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE';
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (url) {
          newItems.push({ file, url, type });
        }
        loadedCount++;
        if (loadedCount === fileArray.length) {
          setValue('mediaList', [...mediaList, ...newItems], { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleRemoveMedia = (index: number) => {
    const updated = mediaList.filter((_, i) => i !== index);
    setValue('mediaList', updated, { shouldValidate: true });
  };

  const onSubmit = async (data: CreatePostFormData) => {
    setLoading(true);
    setError(null);

    try {
      const created = await postService.createPost({
        description: data.description || '',
        files: data.mediaList.map((m) => m.file),
      });
      onPostCreated?.(created);
      onClose();
      reset();
    } catch (err: any) {
      setError(err.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#18181b',
            color: '#f4f4f5',
            borderRadius: 3,
            border: '1px solid #27272a',
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Create New Post
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#a1a1aa' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ borderColor: '#27272a', py: 2 }}>
          {error && (
            <Typography variant="body2" sx={{ color: '#ef4444', mb: 2 }}>
              {error}
            </Typography>
          )}
          {errors.mediaList?.message && (
            <Typography variant="body2" sx={{ color: '#ef4444', mb: 2 }}>
              {errors.mediaList.message}
            </Typography>
          )}

          <Typography variant="subtitle2" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 1 }}>
            Post Caption
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write a caption..."
            {...register('description')}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
            sx={{ mb: 3 }}
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: '#f4f4f5', fontWeight: 600 }}>
              Media Files
            </Typography>
            <Button
              size="small"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<Upload size={16} />}
              sx={{ color: '#0095f6', textTransform: 'none', fontWeight: 600 }}
            >
              Upload from Device
            </Button>
          </Box>

          {mediaList.length === 0 ? (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed #3f3f46',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background-color 0.2s',
                '&:hover': { borderColor: '#0095f6', bgcolor: 'rgba(0, 149, 246, 0.05)' },
              }}
            >
              <Upload size={36} color="#0095f6" style={{ marginBottom: '8px' }} />
              <Typography variant="body2" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 0.5 }}>
                Click to select photos or videos from your device
              </Typography>
              <Typography variant="caption" sx={{ color: '#71717a' }}>
                Supports JPEG, PNG, MP4, WebM
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 1.5, mb: 2 }}>
              {mediaList.map((item, index) => (
                <Paper
                  key={index}
                  sx={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    bgcolor: '#000',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid #3f3f46',
                  }}
                >
                  {item.type === 'VIDEO' ? (
                    <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={item.url} alt={`Upload ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}

                  <Box sx={{ position: 'absolute', top: 4, left: 4, bgcolor: 'rgba(0,0,0,0.6)', borderRadius: '4px', p: '2px 4px', display: 'flex', alignItems: 'center' }}>
                    {item.type === 'VIDEO' ? <Video size={12} color="#fff" /> : <ImageIcon size={12} color="#fff" />}
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => handleRemoveMedia(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: '#ef4444',
                      p: 0.5,
                      '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' },
                    }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} sx={{ color: '#a1a1aa' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || mediaList.length === 0}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ bgcolor: '#0095f6', color: '#fff', '&:hover': { bgcolor: '#1877f2' } }}
          >
            Share
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
