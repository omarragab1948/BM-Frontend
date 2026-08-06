import Cookies from 'js-cookie';
import type { User } from '../types/auth';

const TOKEN_KEY = 'bm_auth_token';
const USER_KEY = 'bm_auth_user';
const COOKIE_EXPIRES_DAYS = 7;

export const getAuthToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'Lax',
    secure: window.location.protocol === 'https:',
  });
};

export const removeAuthToken = (): void => {
  Cookies.remove(TOKEN_KEY);
};

export const getUserCookie = (): User | null => {
  const userJson = Cookies.get(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

export const setUserCookie = (user: User): void => {
  Cookies.set(USER_KEY, JSON.stringify(user), {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'Lax',
    secure: window.location.protocol === 'https:',
  });
};

export const removeUserCookie = (): void => {
  Cookies.remove(USER_KEY);
};

export const clearAuthCookies = (): void => {
  removeAuthToken();
  removeUserCookie();
};
