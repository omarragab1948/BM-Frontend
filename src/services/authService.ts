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

    const token = resData.access_token || resData.token || resData.accessToken || `token_${Date.now()}`;
    const user: User = resData.user || {
      id: resData.id || `usr_${Date.now()}`,
      email: data.email,
      username: data.username,
      createdAt: new Date().toISOString(),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
    };

    return { token, user };
  },


  async login(data: LoginDTO): Promise<AuthResponse> {
    const identifier = data.loginIdentifier.trim();
    
    const payload = {
      emailOrUsername: identifier,
      password: data.password,
    };

    const response = await apiClient.post('/api/auth/login', payload);
    const resData = response.data;

    const token = resData.access_token || resData.token || resData.accessToken || `token_${Date.now()}`;
    const user: User = resData.user || {
      id: resData.id || `usr_${Date.now()}`,
      email: resData.email || identifier,
      username: resData.username || identifier,
      createdAt: new Date().toISOString(),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${resData.username || identifier}`,
    };

    return { token, user };
  },
};
