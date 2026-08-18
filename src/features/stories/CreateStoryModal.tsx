import React, { useState } from 'react';
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
} from '@mui/material';
import { X, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStoryStore } from '../../store/useStoryStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const createStorySchema = z
  .object({
    mediaUrl: z.string().optional(),
    caption: z.string().optional(),
    file: z
      .custom<File>((val) => val === null || val === undefined || val instanceof File, {
        message: 'Invalid file',
      })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => Boolean(data.file instanceof File) || Boolean(data.mediaUrl && data.mediaUrl.trim().length > 0),
    {
      message: 'Please select a photo/video file or enter a media URL.',
      path: ['mediaUrl'],
    }
  );

type CreateStoryFormData = z.infer<typeof createStorySchema>;

export const CreateStoryModal: React.FC<Props> = ({ open, onClose }) => {
  const { createStory } = useStoryStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateStoryFormData>({
    resolver: zodResolver(createStorySchema),
    defaultValues: {
      mediaUrl: '',
      caption: '',
      file: null,
    },
  });

  const mediaUrlInput = watch('mediaUrl') || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setValue('file', file, { shouldValidate: true });
      setValue('mediaUrl', '', { shouldValidate: true });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    reset();
    setPreviewUrl('');
    setErrorMessage(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const onSubmit = async (data: CreateStoryFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const fileToUse = selectedFile || (data.file instanceof File ? data.file : undefined);

    const success = await createStory({
      file: fileToUse,
      mediaUrl: fileToUse ? undefined : data.mediaUrl?.trim() || undefined,
      caption: data.caption?.trim() || undefined,
    });

    setIsSubmitting(false);
    if (success) {
      handleClose();
    } else {
      const storeErr = useStoryStore.getState().error;
      setErrorMessage(storeErr || 'Failed to share story. Please try again.');
    }
  };

  const displayPreview = previewUrl || mediaUrlInput;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #27272a',
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Create 24h Story
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#a1a1aa' }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ borderColor: '#27272a', pt: 2 }}>
          {displayPreview ? (
            <Box sx={{ mb: 2, position: 'relative', borderRadius: 2, overflow: 'hidden', maxHeight: 300, bgcolor: '#09090b', textAlign: 'center' }}>
              <img src={displayPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} />
              <Button
                size="small"
                onClick={() => {
                  setSelectedFile(null);
                  setValue('file', null, { shouldValidate: true });
                  setValue('mediaUrl', '', { shouldValidate: true });
                  setPreviewUrl('');
                }}

                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '11px' }}
              >
                Change
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                p: 3,
                border: '2px dashed #3f3f46',
                borderRadius: 2,
                textAlign: 'center',
                mb: 2,
                bgcolor: '#09090b',
              }}
            >
              <UploadCloud size={40} color="#0095f6" style={{ marginBottom: 8 }} />
              <Typography variant="body2" sx={{ color: '#f4f4f5', fontWeight: 600, mb: 1 }}>
                Upload Photo or Video
              </Typography>
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<ImageIcon size={16} />}
                sx={{ borderColor: '#0095f6', color: '#0095f6', textTransform: 'none', mb: 2 }}
              >
                Choose File
                <input type="file" accept="image/*,video/*" hidden onChange={handleFileChange} />
              </Button>

              <Typography variant="caption" sx={{ color: '#71717a', display: 'block', mb: 1 }}>
                — OR enter media URL —
              </Typography>
              <TextField
                size="small"
                fullWidth
                placeholder="https://images.unsplash.com/..."
                {...register('mediaUrl')}
                error={Boolean(errors.mediaUrl)}
                helperText={errors.mediaUrl?.message}
                sx={{
                  '& .MuiInputBase-root': { bgcolor: '#18181b', color: '#f4f4f5', fontSize: '13px' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3f3f46' },
                }}
              />
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Add a caption..."
            {...register('caption')}
            error={Boolean(errors.caption)}
            helperText={errors.caption?.message}
            sx={{
              '& .MuiInputBase-root': { bgcolor: '#09090b', color: '#f4f4f5', fontSize: '14px' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3f3f46' },
            }}
          />

          {errorMessage && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 1 }}>
              {errorMessage}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} sx={{ color: '#a1a1aa' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ bgcolor: '#0095f6', fontWeight: 600, '&:hover': { bgcolor: '#1877f2' } }}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Share Story'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

