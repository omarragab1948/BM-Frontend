import { z } from 'zod';

export const loginSchema = z.object({
  loginIdentifier: z
    .string()
    .min(1, 'Please enter your email or username'),
  password: z
    .string()
    .min(1, 'Please enter your password'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter an email address')
    .email('Please enter a valid email address'),
  username: z
    .string()
    .min(1, 'Please enter a username')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, dots and underscores are allowed'),
  password: z
    .string()
    .min(1, 'Please enter a password')
    .min(6, 'Password must be at least 6 characters'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
