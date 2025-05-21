"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { user, accessToken, setUser, setAccessToken } = useAuthStore();

  useEffect(() => {
    // 예: localStorage에 토큰이 있으면 서버에서 유저 정보 fetch
    if (accessToken && !user) {
      // 서버에 유저 정보 요청
      fetch("/api/auth/me", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        });
    }
  }, [accessToken, user, setUser]);

  return <>{children}</>;
}