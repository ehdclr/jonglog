"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from 'lucide-react'
import { useAuthStore } from "@/store"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading, isAdmin } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/admin/login")
    }
  }, [loading, isAdmin, router])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">로딩 중...</span>
      </div>
    )
  }


  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}