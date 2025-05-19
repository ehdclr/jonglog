"use client"

import { useQuery, useMutation } from "@apollo/client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { GET_CURRENT_USER } from "@/graphql/auth"
import { LOGOUT_MUTATION } from "@/graphql/auth"

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()

  const { data, loading, error, refetch } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "network-only",
  })

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      // 토큰 제거
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")

      // 쿼리 캐시 초기화
      refetch()

      // 홈페이지로 이동
      router.push("/")
    },
  })

  const user = data?.getCurrentUser
  const isAdmin = user?.role === "admin" || user?.role === "owner"

  // 인증 상태에 따른 리디렉션
  useEffect(() => {
    if (!loading) {
      if (pathname?.startsWith("/admin") && pathname !== "/admin/login") {
        if (!isAdmin) {
          router.push("/admin/login")
        }
      }

      if (pathname === "/admin/login" && isAdmin) {
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
