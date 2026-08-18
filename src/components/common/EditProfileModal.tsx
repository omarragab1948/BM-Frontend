import React, { useState, useRef } from "react";
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
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import { X, Lock, User as UserIcon, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userService } from "../../services/userService";
import type { User } from "../../types/user";
import { setUserCookie } from "../../utils/authCookie";
import { useAuthStore } from "../../store/useAuthStore";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdated?: (updated: User) => void;
}

const editProfileSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  bio: z.string().optional(),
  isPrivate: z.boolean(),
  avatarFile: z.instanceof(File).nullable().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onClose,
  user,
  onProfileUpdated,
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string>(
    user.avatarUrl || "",
  );
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: user.username,
      bio: user.bio || "",
      isPrivate: user.isPrivate || false,
      avatarFile: null,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const isPrivateValue = watchProfile("isPrivate");
  const currentUsername = watchProfile("username") || user.username;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileValue("avatarFile", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) setAvatarPreview(evt.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSaveProfile = async (data: EditProfileFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    console.log(data);
    try {
      const updated = await userService.updateProfile({
        username: data.username,
        bio: data.bio,
        isPrivate: data.isPrivate,
        avatarFile: data.avatarFile || null,
      });

      setUserCookie(updated);
      useAuthStore.setState({ user: updated });
      onProfileUpdated?.(updated);
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(res.message || "Password changed successfully");
      resetPasswordForm();
    } catch (err: any) {
      setError(err.message || "Error changing password");
    } finally {
      setChangingPassword(false);
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
            bgcolor: "#18181b",
            color: "#f4f4f5",
            borderRadius: 3,
            border: "1px solid #27272a",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          Edit Profile
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "#a1a1aa" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: "#27272a", py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleProfileSubmit(onSaveProfile)}
          sx={{ mb: 3 }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: "#0095f6",
              fontWeight: 600,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <UserIcon size={16} /> Basic Information
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
            <Avatar
              src={avatarPreview}
              sx={{ width: 56, height: 56, bgcolor: "#0095f6" }}
            >
              {currentUsername.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => avatarInputRef.current?.click()}
                startIcon={<Upload size={14} />}
                sx={{
                  borderColor: "#3f3f46",
                  color: "#f4f4f5",
                  textTransform: "none",
                  fontSize: "13px",
                }}
              >
                Change Avatar Picture
              </Button>
            </Box>
          </Box>

          <TextField
            fullWidth
            size="small"
            label="Username"
            {...registerProfile("username")}
            error={Boolean(profileErrors.username)}
            helperText={profileErrors.username?.message}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            label="Bio"
            {...registerProfile("bio")}
            error={Boolean(profileErrors.bio)}
            helperText={profileErrors.bio?.message}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isPrivateValue}
                onChange={(e) => setProfileValue("isPrivate", e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#0095f6" },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "#d4d4d8" }}>
                Private Account (requires follow approval)
              </Typography>
            }
          />

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={16} color="inherit" /> : null
              }
              sx={{
                bgcolor: "#0095f6",
                color: "#fff",
                "&:hover": { bgcolor: "#1877f2" },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: "#27272a" }} />

        <Box component="form" onSubmit={handlePasswordSubmit(onChangePassword)}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#0095f6",
              fontWeight: 600,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Lock size={16} /> Security & Password
          </Typography>

          <TextField
            fullWidth
            type="password"
            size="small"
            label="Current Password"
            {...registerPassword("currentPassword")}
            error={Boolean(passwordErrors.currentPassword)}
            helperText={passwordErrors.currentPassword?.message}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            size="small"
            label="New Password"
            {...registerPassword("newPassword")}
            error={Boolean(passwordErrors.newPassword)}
            helperText={passwordErrors.newPassword?.message}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="outlined"
              disabled={changingPassword}
              startIcon={
                changingPassword ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
              sx={{ borderColor: "#3f3f46", color: "#f4f4f5" }}
            >
              Change Password
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: "#a1a1aa" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
