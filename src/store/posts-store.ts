// src/store/posts-store.ts
import { create } from 'zustand'
import { Post } from '@/types/post'
import { api } from '@/utils/api'

interface PostsState {
  posts: Post[]
  currentPost: Post | null
  loading: boolean
  error: string | null
  
  fetchPosts: () => Promise<void>
  fetchPostById: (id: string) => Promise<void>
  createPost: (post: Omit<Post, 'id'>) => Promise<boolean>
  updatePost: (id: string, post: Partial<Post>) => Promise<boolean>
  deletePost: (id: string) => Promise<boolean>
  clearError: () => void
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  
  clearError: () => set({ error: null }),
  
  fetchPosts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/api/graphql', {
        params: {
          query: `
            query GetPosts {
              posts {
                id
                title
                excerpt
                isPublic
                createdAt
                author {
                  name
                }
                category {
                  name
                }
              }
            }
          `
        }
      })
      
      const { data } = response.data
      set({ posts: data.posts, loading: false })
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "게시물을 불러오는데 실패했습니다."
      set({ loading: false, error: message })
    }
  },
  
  fetchPostById: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/api/graphql', {
        params: {
          query: `
            query GetPost($id: ID!) {
              post(id: $id) {
                id
                title
                content
                excerpt
                isPublic
                createdAt
                author {
                  name
                }
                category {
                  name
                }
              }
            }
          `,
          variables: { id }
        }
      })
      
      const { data } = response.data
      set({ currentPost: data.post, loading: false })
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "게시물을 불러오는데 실패했습니다."
      set({ loading: false, error: message })
    }
  },
  
  createPost: async (post) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/api/graphql', {
        query: `
          mutation CreatePost($input: CreatePostInput!) {
            createPost(input: $input) {
              id
              title
            }
          }
        `,
        variables: { input: post }
      })
      
      const { data, errors } = response.data
      
      if (errors) {
        set({ loading: false, error: errors[0].message })
        return false
      }
      
      // 새 게시물을 목록에 추가
      const posts = get().posts
      set({ 
        posts: [...posts, data.createPost], 
        loading: false 
      })
      
      return true
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "게시물 생성에 실패했습니다."
      set({ loading: false, error: message })
      return false
    }
  },
  
  updatePost: async (id, post) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/api/graphql', {
        query: `
          mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
            updatePost(id: $id, input: $input) {
              id
              title
            }
          }
        `,
        variables: { id, input: post }
      })
      
      const { data, errors } = response.data
      
      if (errors) {
        set({ loading: false, error: errors[0].message })
        return false
      }
      
      // 게시물 목록 업데이트
      const posts = get().posts.map(p => 
        p.id === id ? { ...p, ...data.updatePost } : p
      )
      
      set({ 
        posts, 
        currentPost: data.updatePost,
        loading: false 
      })
      
      return true
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "게시물 수정에 실패했습니다."
      set({ loading: false, error: message })
      return false
    }
  },
  
  deletePost: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/api/graphql', {
        query: `
          mutation DeletePost($id: ID!) {
            deletePost(id: $id)
          }
        `,
        variables: { id }
      })
      
      const { data, errors } = response.data
      
      if (errors) {
        set({ loading: false, error: errors[0].message })
        return false
      }
      
      // 게시물 목록에서 삭제
      const posts = get().posts.filter(p => p.id !== id)
      set({ 
        posts, 
        currentPost: null,
        loading: false 
      })
      
      return true
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "게시물 삭제에 실패했습니다."
      set({ loading: false, error: message })
      return false
    }
  }
}))