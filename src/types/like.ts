import type { User } from './user';

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
  user: User;
}
