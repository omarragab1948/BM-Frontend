import { create } from 'zustand';
import type { AuthState, LoginDTO, RegisterDTO } from '../types/auth';
import {
  getAuthToken,
  getUserCookie,
  setAuthToken,
  setUserCookie,
  clearAuthCookies,
} from '../utils/authCookie';
import { authService } from '../services/authService';

const initialToken = getAuthToken();
const initialUser = getUserCookie();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: initialToken || null,
  isAuthenticated: !!initialToken && !!initialUser,
  isLoading: false,
  loginError: null,
  registerError: null,

  login: async (credentials: LoginDTO): Promise<boolean> => {
    set({ isLoading: true, loginError: null });

    try {
      const res = await authService.login(credentials);

      setAuthToken(res.token);
      setUserCookie(res.user);

      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        loginError: null,
      });

      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        loginError: err.message || 'Login failed. Please check your credentials.',
      });
      return false;
    }
  },

  register: async (data: RegisterDTO): Promise<boolean> => {
    set({ isLoading: true, registerError: null });

    try {
      const res = await authService.register(data);

      setAuthToken(res.token);
      setUserCookie(res.user);

      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        registerError: null,
      });

      return true;
    } catch (err: any) {
      set({
        isLoading: false,
        registerError: err.message || 'Registration failed. Please try again.',
      });
      return false;
    }
  },

  logout: () => {
    clearAuthCookies();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      loginError: null,
      registerError: null,
    });
  },

  clearErrors: () => {
    set({ loginError: null, registerError: null });
  },
}));
