import type { User } from './user';

export type MediaType = 'IMAGE' | 'VIDEO';

export interface PostMedia {
  id: string;
  url: string;
  type: MediaType;
  order: number;
}

export interface Post {
  id: string;
  authorId: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  author: User;
  media: PostMedia[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export interface CreatePostDTO {
  description?: string;
  files?: File[];
  media?: {
    url: string;
    type: MediaType;
    order?: number;
  }[];
}
