"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Loader2,
  Lock,
  User,
} from "lucide-react";
import { motion } from "framer-motion";

interface UserInfo {
  name: string;
  email: string;
}

export default function JoinCompletePage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 토큰 유효성 검증 및 사용자 정보 가져오기
  useEffect(() => {
    const validateToken = async () => {
      try {
        // 실제 구현에서는 API 호출로 대체
        // const response = await fetch(`/api/join/validate-token/${params.token}`)
        // if (!response.ok) throw new Error("유효하지 않은 토큰입니다.")
        // const data = await response.json()

        // 임시 구현: API 호출 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 임시 데이터
        const data = {
          name: "홍길동",
          email: "user@example.com",
        };

        setUserInfo(data);
      } catch (error) {
        console.error("토큰 검증 오류:", error);
        setError(
          "유효하지 않거나 만료된 초대 링크입니다. 관리자에게 문의하세요."
        );
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [params.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast({
        title: "입력 오류",
        description: "사용자 이름과 비밀번호는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 실제 구현에서는 API 호출로 대체
      // const response = await fetch(`/api/join/complete/${params.token}`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ username, password, bio }),
      // })

      // 임시 구현: API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // if (!response.ok) throw new Error("가입 완료 처리 중 오류가 발생했습니다.")

      setIsSuccess(true);
      toast({
        title: "가입 완료",
        description:
          "블로그 가입이 성공적으로 완료되었습니다. 로그인 페이지로 이동합니다.",
      });

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("가입 완료 오류:", error);
      toast({
        title: "가입 실패",
        description: "가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-md py-12 flex justify-center">
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4">초대 링크 확인 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md py-12">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold">링크 오류</h3>
              <p className="text-muted-foreground mt-2 mb-6">{error}</p>
              <Button onClick={() => router.push("/")}>홈으로 돌아가기</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              블로그 가입 완료
            </CardTitle>
            <CardDescription>
              {userInfo?.name}님, 환영합니다! 블로그 이용을 위한 추가 정보를
              입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold">
                  가입이 완료되었습니다!
                </h3>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {userInfo?.email}
                  </span>{" "}
                  계정으로 로그인할 수 있습니다.
                </p>
                <p className="text-sm text-muted-foreground">
                  잠시 후 로그인 페이지로 이동합니다...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">
                    사용자 이름 <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="사용할 아이디를 입력하세요"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-8"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    영문, 숫자, 밑줄(_)만 사용 가능합니다.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    비밀번호 <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-8"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    비밀번호 확인 <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-8"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">
                    자기소개{" "}
                    <span className="text-muted-foreground text-sm">
                      (선택사항)
                    </span>
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="간단한 자기소개를 입력하세요"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      가입 완료하기
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
  );
}
