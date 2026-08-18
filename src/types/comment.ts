import type { User } from './user';

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user: User;
}

export interface CreateCommentDTO {
  content: string;
}
