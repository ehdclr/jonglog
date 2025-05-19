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
      localStorage.removeItem("token")

      // 쿼리 캐시 초기화
      refetch()

      // 홈페이지로 이동
      router.push("/")
    },
  })

  const user = data?.me
  const isAdmin = user?.role === "admin" || user?.role === "owner"

  // 인증 상태에 따른 리디렉션
  useEffect(() => {
    if (!loading) {
      // 관리자 페이지 접근 시 로그인 확인
      if (pathname?.startsWith("/admin") && pathname !== "/admin/login") {
        if (!isAdmin) {
          router.push("/admin/login")
        }
      }

      // 이미 로그인한 상태에서 로그인 페이지 접근 시 대시보드로 리디렉션
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
