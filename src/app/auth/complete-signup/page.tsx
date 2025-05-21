"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import axios from "axios";

// UI 컴포넌트
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, AlertCircle, CheckCircle, Upload } from 'lucide-react';

// 폼 타입 정의
interface FormValues {
  name: string;
  bio: string;
  avatarUrl: string;
}

export default function CompleteSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupRequestId = searchParams.get("signupRequestId");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // 폼 초기화 - Zod 없이 React Hook Form만 사용
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      bio: "",
      avatarUrl: "",
    },
  });
  
  // signupRequestId 유효성 검사
  useEffect(() => {
    if (!signupRequestId) {
      setError("유효하지 않은 가입 요청입니다. 관리자에게 문의하세요.");
      return;
    }
    
    // 가입 요청 정보 가져오기
    const fetchSignupRequest = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/auth/signup-request/${signupRequestId}`);
        
        if (response.data.email) {
          setUserEmail(response.data.email);
        } else {
          setError("가입 요청 정보를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("가입 요청 정보 조회 실패:", err);
        setError("가입 요청 정보를 가져오는 중 오류가 발생했습니다. 링크가 만료되었거나 유효하지 않을 수 있습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSignupRequest();
  }, [signupRequestId]);
  
  // 아바타 업로드 처리
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 파일 크기 제한 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      form.setError("avatarUrl", { 
        type: "manual",
        message: "파일 크기는 2MB 이하여야 합니다." 
      });
      return;
    }
    
    // 이미지 파일 타입 검사
    if (!file.type.startsWith("image/")) {
      form.setError("avatarUrl", { 
        type: "manual",
        message: "이미지 파일만 업로드 가능합니다." 
      });
      return;
    }
    
    try {
      // 파일 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // 실제 구현에서는 여기서 파일을 서버에 업로드하고 URL을 받아옴
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await axios.post("/api/upload", formData);
      form.setValue("avatarUrl", response.data.url);
    } catch (err) {
      console.error("아바타 업로드 실패:", err);
      form.setError("avatarUrl", { 
        type: "manual",
        message: "이미지 업로드 중 오류가 발생했습니다." 
      });
    }
  };
  
  // 폼 제출 전 유효성 검사
  const validateForm = (data: FormValues): boolean => {
    let isValid = true;
    
    // 이름 필드 검증
    if (!data.name || data.name.trim().length < 2) {
      form.setError("name", {
        type: "manual",
        message: "이름은 2자 이상이어야 합니다."
      });
      isValid = false;
    }
    
    return isValid;
  };
  
  // 폼 제출 처리
  const onSubmit = async (data: FormValues) => {
    if (!signupRequestId) return;
    
    // 폼 유효성 검사
    if (!validateForm(data)) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post("/api/auth/complete-signup", {
        signupRequestId,
        name: data.name,
        bio: data.bio || "",
        avatarUrl: data.avatarUrl || "",
      });
      
      setSuccess(true);
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      console.error("가입 완료 실패:", err);
      setError(err.response?.data?.message || "가입 완료 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };
  
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
    );
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
    );
  }
  
  // 성공 표시
  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
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
    );
  }
  
  // 폼 렌더링
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">가입 완료하기</CardTitle>
          <CardDescription>
            {userEmail && `${userEmail} 계정의 추가 정보를 입력해주세요.`}
          </CardDescription>
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
                <FormDescription>
                  이메일은 변경할 수 없습니다.
                </FormDescription>
              </FormItem>
              
              {/* 이름 입력 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름 *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="이름을 입력하세요" 
                        {...field} 
                        required
                        minLength={2}
                      />
                    </FormControl>
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
                    <FormDescription>
                      2MB 이하의 이미지 파일을 업로드하세요.
                    </FormDescription>
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
                    <FormDescription>
                      선택 사항입니다. 나중에 프로필에서 수정할 수 있습니다.
                    </FormDescription>
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
            가입을 완료하면 블로그의 <a href="/terms" className="underline">이용약관</a>과 <a href="/privacy" className="underline">개인정보처리방침</a>에 동의하게 됩니다.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}