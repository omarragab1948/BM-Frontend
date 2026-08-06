import { create } from 'zustand';
import type { AuthState, User, LoginDTO, RegisterDTO } from '../types/auth';
import {
  getAuthToken,
  getUserCookie,
  setAuthToken,
  setUserCookie,
  clearAuthCookies,
} from '../utils/authCookie';
import { authService } from '../services/authService';

const MOCK_USERS_KEY = 'bm_mock_registered_users';

const getStoredMockUsers = (): (User & { password: string })[] => {
  try {
    const data = localStorage.getItem(MOCK_USERS_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }
  return [
    {
      id: 'usr_default',
      email: 'user@example.com',
      username: 'johndoe',
      password: 'password123',
      createdAt: new Date().toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      bio: 'Exploring code and social design ✨',
    },
  ];
};

const saveMockUser = (user: User & { password: string }) => {
  const users = getStoredMockUsers();
  users.push(user);
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

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
      if (err.message?.includes('Network Error') || err.message?.includes('ECONNREFUSED')) {
        const identifier = credentials.loginIdentifier.trim().toLowerCase();
        const mockUsers = getStoredMockUsers();
        const foundUser = mockUsers.find(
          (u) =>
            (u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier) &&
            u.password === credentials.password
        );

        if (foundUser) {
          const token = `mock_jwt_token_${Date.now()}`;
          const { password, ...safeUser } = foundUser;
          setAuthToken(token);
          setUserCookie(safeUser);
          set({ user: safeUser, token, isAuthenticated: true, isLoading: false, loginError: null });
          return true;
        }
      }

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
      if (err.message?.includes('Network Error') || err.message?.includes('ECONNREFUSED')) {
        const email = data.email.trim().toLowerCase();
        const username = data.username.trim().toLowerCase();
        const mockUsers = getStoredMockUsers();

        if (mockUsers.some((u) => u.email.toLowerCase() === email)) {
          set({ isLoading: false, registerError: 'Account with this email already exists.' });
          return false;
        }

        const newUser: User & { password: string } = {
          id: `usr_${Date.now()}`,
          email,
          username: data.username.trim(),
          password: data.password,
          createdAt: new Date().toISOString(),
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          bio: 'Welcome to ВМ!',
        };

        saveMockUser(newUser);
        const token = `mock_jwt_token_${Date.now()}`;
        const { password, ...safeUser } = newUser;
        setAuthToken(token);
        setUserCookie(safeUser);
        set({ user: safeUser, token, isAuthenticated: true, isLoading: false, registerError: null });
        return true;
      }

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
