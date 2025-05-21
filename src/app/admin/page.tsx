"use client";

import { useAuthStore } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboardPage() {
  const { user, accessToken } = useAuthStore();
  const router = useRouter();

  

  useEffect(() => {
    console.log(" accessToken ", accessToken);
    if (!accessToken) {
      router.push("/admin/login");
    }
  }, [accessToken, router]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">대시보드</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>환영합니다</CardTitle>
            <CardDescription>관리자 대시보드</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">
              {user?.role === "owner" ? "소유자" : "관리자"}
            </p>
          </CardContent>
        </Card>

        {/* {loading ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>통계 로딩 중</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>오류 발생</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">통계를 불러오는 중 오류가 발생했습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>게시물</CardTitle>
                <CardDescription>총 게시물 수</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.stats?.totalPosts || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>파일</CardTitle>
                <CardDescription>총 파일 수</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.stats?.totalFiles || 0}</p>
              </CardContent>
            </Card>

            {user?.role === "owner" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>관리자</CardTitle>
                  <CardDescription>등록된 관리자 수</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data?.stats?.totalAdmins || 0}</p>
                </CardContent>
              </Card>
            )} */}
        {/* </> */}
        {/* )} */}
      </div>
    </div>
  );
}
