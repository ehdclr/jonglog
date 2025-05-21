"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, ArrowRight, CheckCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { api } from "@/utils/api"

export default function JoinRequestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [requestData, setRequestData] = useState({
    status: "pending",
    message: "",
    canResend: false,
    expiresAt: null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast({
        title: "입력 오류",
        description: "이름과 이메일은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "이메일 형식 오류",
        description: "유효한 이메일 주소를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 실제 구현에서는 API 호출로 대체
      const response = await fetch("/api/join/join-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })

            
      if (!response.ok) throw new Error("요청 처리 중 오류가 발생했습니다.")
      const data = await response.json()
      
      setRequestData({...data})
      setIsSuccess(true)
      toast({
        title: "요청 완료",
        description: "가입 요청이 성공적으로 제출되었습니다. 관리자 승인 후 이메일로 안내가 발송됩니다.",
      })
    } catch (error) {
      console.error("가입 요청 오류:", error)
      toast({
        title: "요청 실패",
        description: "가입 요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-md py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">블로그 가입 요청</CardTitle>
            <CardDescription>
              블로그 가입을 위해 기본 정보를 입력해주세요. 관리자 승인 후 이메일로 안내가 발송됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold">요청이 접수되었습니다</h3>
                {requestData.status === "pending" ? <p className="text-muted-foreground">
                  관리자 승인 후 <span className="font-medium text-foreground">{email}</span> 주소로 가입 안내 메일이
                  발송됩니다.
                </p> : <p className="text-muted-foreground">
                  {requestData.message}
                </p>}
                <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
                  홈으로 돌아가기
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    이름 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    이메일 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">
                    가입 사유 <span className="text-muted-foreground text-sm">(선택사항)</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="블로그에 가입하려는 이유를 간략히 적어주세요."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
                <div className="text-sm text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>관리자 승인 후 입력하신 이메일로 추가 가입 정보를 입력할 수 있는 링크가 발송됩니다.</p>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      가입 요청하기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
