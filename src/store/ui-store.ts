// src/store/ui-store.ts
import { create } from 'zustand'
import { BlogSettings } from "../types/blog-settings"
interface UIState {
  blogSettings : BlogSettings
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setBlogSettings: (blogSettings: BlogSettings) => void
}

export const useUIStore = create<UIState>((set) => ({
  blogSettings: {
    id: '',
    blogName: '',
    blogDescription: '',
    isGithubPublic: false,
    isEmailPublic: false,
    isSnsPublic: false,
  },
  sidebarOpen: true,
  theme: 'system',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setBlogSettings: (blogSettings) => set({ blogSettings }),
}))