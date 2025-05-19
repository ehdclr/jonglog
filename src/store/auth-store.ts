// src/store/auth-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types/auth'
import { api } from '@/utils/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  loading: boolean
  error: string | null
  isAdmin: boolean
  
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      loading: false,
      error: null,
      isAdmin: false,
      
      setUser: (user) => set({ 
        user, 
        isAdmin: user?.role === "owner" || user?.role === "admin" 
      }),
      
      setAccessToken: (accessToken) => set({ accessToken }),
      
      clearError: () => set({ error: null }),
      
      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/api/auth/login', { email, password })
          const { user, accessToken, success, message } = response.data
          
          if (success) {
            set({ 
              user, 
              accessToken,
              isAdmin: user.role === "owner" || user.role === "admin",
              loading: false,
              error: null
            })
          } else {
            set({ loading: false, error: message })
          }
          
          return { success, message }
        } catch (error: any) {
          const message = error.response?.data?.message || error.message || "로그인에 실패했습니다."
          set({ loading: false, error: message })
          return { success: false, message }
        }
      },
      
      logout: async () => {
        set({ loading: true })
        try {
          await api.post('/api/auth/logout')
        } catch (error) {
          console.error("로그아웃 오류:", error)
        } finally {
          set({ 
            user: null, 
            accessToken: null, 
            isAdmin: false, 
            loading: false 
          })
        }
      },
      
      refreshToken: async () => {
        try {
          const response = await api.post('/api/auth/refresh')
          const { accessToken } = response.data
          
          if (accessToken) {
            set({ accessToken })
            return true
          }
          return false
        } catch (error) {
          console.error("토큰 갱신 오류:", error)
          set({ 
            user: null, 
            accessToken: null, 
            isAdmin: false 
          })
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // accessToken만 localStorage에 저장하고 나머지는 메모리에만 유지
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
)