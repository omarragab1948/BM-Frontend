export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface RegisterDTO {
  email: string;
  username: string;
  password: string;
}

export interface LoginDTO {
  loginIdentifier: string; 
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  registerError: string | null;
  login: (credentials: LoginDTO) => Promise<boolean>;
  register: (data: RegisterDTO) => Promise<boolean>;
  logout: () => void;
  clearErrors: () => void;
}
