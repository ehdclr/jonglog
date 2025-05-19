// src/app/providers.tsx
"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store"
import { api } from "@/utils/api"

export function Providers({ children }: { children: React.ReactNode }) {
  const { accessToken, setUser } = useAuthStore()
  
  useEffect(() => {
    const loadUser = async () => {
      if (accessToken) {
        try {
          const response = await api.post('/api/graphql', {
            query: `
              query {
                getCurrentUser {
                  user {
                    id
                    email
                    name
                    role
                    avatarUrl
                  }
                  success
                  message
                }
              }
            `
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          })
          const { data, errors } = response.data
          
          if (errors) {
            console.error('GraphQL 오류:', errors)
            return
          }
          
          if (data?.getCurrentUser?.user) {
            setUser(data.getCurrentUser.user)
          }
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error)
          throw new Error('사용자 정보 로드 실패')
        }
      }
    }
    
    loadUser()
  }, [accessToken, setUser])  // 의존성 배열에 setUser가 포함됨
  
  return children
}