"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import axios from "axios"

// UI 컴포넌트
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, AlertCircle, CheckCircle, Upload, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 폼 타입 정의
interface FormValues {
  name: string
  password: string
  confirmPassword: string
  bio: string
  avatarUrl: string
}

export default function CompleteSignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const signupRequestId = searchParams.get("signupRequestId")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  // 폼 초기화
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
      bio: "",
      avatarUrl: "",
    },
  })

  // signupRequestId 유효성 검사
  useEffect(() => {
    if (!signupRequestId) {
      setError("유효하지 않은 가입 요청입니다. 관리자에게 문의하세요.")
      return
    }

    const fetchSignupRequest = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/auth/signup-request/${signupRequestId}`,{
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
          },

        })
        const data = await response.json()

        if (!data.success) {
          setError(data.message || "가입 요청 정보를 찾을 수 없습니다.")
          return
        }

        if (data.payload?.email) {
          setUserEmail(data.payload.email)
        } else {
          setError("가입 요청 정보를 찾을 수 없습니다.")
        }
      } catch (err) {
        console.error("가입 요청 정보 조회 실패:", err)
        setError("가입 요청 정보를 가져오는 중 오류가 발생했습니다. 링크가 만료되었거나 유효하지 않을 수 있습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSignupRequest()
  }, [signupRequestId])

  // 아바타 업로드 처리
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 제한 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      form.setError("avatarUrl", {
        type: "manual",
        message: "파일 크기는 2MB 이하여야 합니다.",
      })
      return
    }

    // 이미지 파일 타입 검사
    if (!file.type.startsWith("image/")) {
      form.setError("avatarUrl", {
        type: "manual",
        message: "이미지 파일만 업로드 가능합니다.",
      })
      return
    }

    try {
      // 파일 미리보기 생성
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // 파일 업로드
      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post("/api/upload", formData)
      form.setValue("avatarUrl", response.data.url)

      toast({
        title: "이미지 업로드 성공",
        description: "프로필 이미지가 업로드되었습니다.",
      })
    } catch (err) {
      console.error("아바타 업로드 실패:", err)
      form.setError("avatarUrl", {
        type: "manual",
        message: "이미지 업로드 중 오류가 발생했습니다.",
      })

      toast({
        title: "이미지 업로드 실패",
        description: "이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  // 폼 제출 전 유효성 검사
  const validateForm = (data: FormValues): boolean => {
    let isValid = true

    // 이름 필드 검증
    if (!data.name || data.name.trim().length < 2) {
      form.setError("name", {
        type: "manual",
        message: "이름은 2자 이상이어야 합니다.",
      })
      isValid = false
    }

    // 비밀번호 필드 검증
    if (!data.password) {
      form.setError("password", {
        type: "manual",
        message: "비밀번호를 입력해주세요.",
      })
      isValid = false
    } else if (data.password.length < 8) {
      form.setError("password", {
        type: "manual",
        message: "비밀번호는 8자 이상이어야 합니다.",
      })
      isValid = false
    }

    // 비밀번호 확인 필드 검증
    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "비밀번호가 일치하지 않습니다.",
      })
      isValid = false
    }

    return isValid
  }

  // 폼 제출 처리
  const onSubmit = async (data: FormValues) => {
    if (!signupRequestId) return

    // 폼 유효성 검사
    if (!validateForm(data)) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signupRequestId,
          name: data.name,
          password: data.password,
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "가입 완료 중 오류가 발생했습니다.")
      }

      setSuccess(true)

      toast({
        title: "가입 완료",
        description: "회원가입이 성공적으로 완료되었습니다. 로그인 페이지로 이동합니다.",
      })

      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      console.error("가입 완료 실패:", err)
      setError(err.message || "가입 완료 중 오류가 발생했습니다. 다시 시도해주세요.")

      toast({
        title: "가입 실패",
        description: err.message || "가입 완료 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 로딩 중 표시
  if (isLoading && !userEmail) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">가입 정보를 확인하는 중입니다...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 에러 표시
  if (error && !success) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold">오류가 발생했습니다</h3>
              <p className="text-muted-foreground mt-2 mb-6">{error}</p>
              <Button onClick={() => router.push("/")}>홈으로 돌아가기</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 성공 표시
  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-green-100 p-3 mb-4 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">가입이 완료되었습니다!</h3>
              <p className="text-muted-foreground mt-2">
                <span className="font-medium text-foreground">{userEmail}</span> 계정으로 로그인할 수 있습니다.
              </p>
              <p className="text-sm text-muted-foreground mt-4">잠시 후 로그인 페이지로 이동합니다...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 폼 렌더링
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">가입 완료하기</CardTitle>
          <CardDescription>{userEmail && `${userEmail} 계정의 추가 정보를 입력해주세요.`}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 이메일 표시 (수정 불가) */}
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input value={userEmail || ""} disabled />
                </FormControl>
                <FormDescription>이메일은 변경할 수 없습니다.</FormDescription>
              </FormItem>

              {/* 이름 입력 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름 *</FormLabel>
                    <FormControl>
                      <Input placeholder="이름을 입력하세요" {...field} required minLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 비밀번호 입력 */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 *</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="비밀번호를 입력하세요"
                          {...field}
                          required
                          minLength={8}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormDescription>8자 이상의 안전한 비밀번호를 입력하세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 비밀번호 확인 입력 */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인 *</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="비밀번호를 다시 입력하세요"
                          {...field}
                          required
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 아바타 업로드 */}
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>프로필 이미지</FormLabel>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={avatarPreview || ""} alt="프로필 이미지" />
                        <AvatarFallback>{userEmail?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("avatar-upload")?.click()}
                          className="w-full"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          이미지 업로드
                        </Button>
                      </div>
                    </div>
                    <FormDescription>2MB 이하의 이미지 파일을 업로드하세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 자기소개 입력 */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>자기소개</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="간단한 자기소개를 입력하세요"
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>선택 사항입니다. 나중에 프로필에서 수정할 수 있습니다.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 제출 버튼 */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  "가입 완료하기"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-xs text-muted-foreground text-center">
            가입을 완료하면 블로그의{" "}
            <a href="/terms" className="underline">
              이용약관
            </a>
            과{" "}
            <a href="/privacy" className="underline">
              개인정보처리방침
            </a>
            에 동의하게 됩니다.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
