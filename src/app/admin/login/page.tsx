// src/app/admin/login/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { useAuthStore } from "@/store"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  
  const { login, loading, error, isAdmin, clearError } = useAuthStore()
  
  // 이미 로그인한 경우 대시보드로 리디렉션
  useEffect(() => {
    if (!loading && isAdmin) {
      router.push("/admin");
    }
  }, [loading, isAdmin, router]);

    
  // 입력 필드 변경 시 오류 메시지 초기화
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [email, password, error, clearError])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { success } = await login(email, password)
    
    if (success) {
      router.push("/admin")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>관리자 로그인</CardTitle>
          <CardDescription>블로그 관리를 위해 로그인하세요.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}