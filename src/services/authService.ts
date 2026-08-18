import { apiClient } from './apiClient';
import type { LoginDTO, RegisterDTO, User } from '../types/auth';

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/register', {
      email: data.email.trim(),
      username: data.username.trim(),
      password: data.password,
    });

    const resData = response.data;
    const token = resData.accessToken || resData.access_token || resData.token;
    return { token, user: resData.user };
  },

  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', {
      emailOrUsername: data.loginIdentifier.trim(),
      password: data.password,
    });

    const resData = response.data;
    const token = resData.accessToken || resData.access_token || resData.token;
    return { token, user: resData.user };
  },
};
