import { z } from 'zod';

export const loginSchema = z.object({
  loginIdentifier: z
    .string()
    .min(1, 'Введите Email или имя пользователя'),
  password: z
    .string()
    .min(1, 'Введите пароль'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Введите адрес электронной почты')
    .email('Введите корректный адрес Email'),
  username: z
    .string()
    .min(1, 'Введите имя пользователя')
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(30, 'Имя пользователя слишком длинное')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Разрешены только латинские буквы, цифры, точки и подчеркивания'),
  password: z
    .string()
    .min(1, 'Придумайте пароль')
    .min(6, 'Пароль должен содержать минимум 6 символов'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
