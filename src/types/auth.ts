// src/types/auth.ts
export type UserRole = 'owner' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  bio?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface LoginResponse {
  user: User
  accessToken: string
  success: boolean
  message: string
}

export interface RefreshTokenResponse {
  accessToken: string
  success: boolean
}