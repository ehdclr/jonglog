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
  hasHydrated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  clearError: () => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      loading: false,
      error: null,
      isAdmin: false,
      hasHydrated: false,
      
      setUser: (user) => set({ 
        user, 
        isAdmin: user?.role === "owner" || user?.role === "admin" 
      }),

      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),
      
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
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${get().accessToken}`
            },
            credentials: 'include'
          })
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
      
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken ,user: state.user}),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)