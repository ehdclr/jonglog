"use client"

import { useQuery, useMutation } from "@apollo/client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { GET_CURRENT_USER } from "@/graphql/auth"
import { LOGOUT_MUTATION, REFRESH_TOKEN_MUTATION } from "@/graphql/auth"
import { useAuthStore } from "@/store/auth-store"

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const { accessToken, setAccessToken } = useAuthStore()

  // 현재 유저 정보 조회
  const { data, loading, error, refetch } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "network-only",
    skip: !accessToken, // accessToken이 없으면 쿼리 스킵
  })

  // 토큰 갱신 mutation
  const [refreshToken] = useMutation(REFRESH_TOKEN_MUTATION, {
    onCompleted: (data) => {
      if (data?.refreshToken?.accessToken) {
        setAccessToken(data.refreshToken.accessToken)
        localStorage.setItem("accessToken", data.refreshToken.accessToken)
        refetch() // 유저 정보 다시 조회
      }
    },
    onError: () => {
      signOut()
    }
  })

  // 로그아웃 mutation
  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      setAccessToken(null)
      localStorage.removeItem("accessToken")
      refetch()
      router.push("/")
    },
  })

  // 토큰 체크 및 갱신
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (!accessToken) {
        try {
          await refreshToken()
        } catch (error) {
          console.error("Token refresh failed:", error)
          signOut()
        }
      }
    }

    checkAndRefreshToken()
  }, [accessToken, refreshToken])

  const user = data?.getCurrentUser
  const isAdmin = user?.role === "admin" || user?.role === "owner"

  // 인증 상태에 따른 리디렉션
  useEffect(() => {
    if (!loading) {
      if (pathname?.startsWith("/admin") && pathname !== "/admin/login") {
        if (!isAdmin) {
          router.push("/admin/login")
        }
      } else if (pathname === "/admin/login" && isAdmin) {
        router.push("/admin")
      }
    }
  }, [loading, isAdmin, pathname, router])

  const signOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return {
    user,
    loading,
    error,
    isAdmin,
    signOut,
    refetch,
  }
}