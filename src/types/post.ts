// src/types/post.ts
import { User } from './auth'

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Post {
  id: string
  title: string
  content?: string
  excerpt?: string
  isPublic: boolean
  isDraft?: boolean
  createdAt: string
  updatedAt?: string
  publishedAt?: string
  author: User
  category?: Category
}

export interface CreatePostInput {
  title: string
  content?: string
  excerpt?: string
  isPublic: boolean
  isDraft?: boolean
  categoryId?: string
}

export interface UpdatePostInput {
  title?: string
  content?: string
  excerpt?: string
  isPublic?: boolean
  isDraft?: boolean
  categoryId?: string
}