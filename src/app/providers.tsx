// src/app/providers.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store";
import { api } from "@/utils/api";

export function Providers({ children }: { children: React.ReactNode }) {
  const { accessToken, setAccessToken, setUser } = useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      let token = accessToken;
      if (!token) {
        try {
          const response = await api.post("/api/auth/refresh", undefined, {
            withCredentials: true,
          });
          const { accessToken: newAccessToken } = response.data;
          if (newAccessToken) {
            setAccessToken(newAccessToken);
            token = newAccessToken;
          } else {
            setUser(null);
            return;
          }
        } catch (error) {
          console.error("액세스 토큰 재발급 실패:", error);
          setUser(null);
          return;
        }
      }

      try {
        const response = await api.post(
          "/api/graphql",
          {
            query: `
            query {
              getCurrentUser {
                user {
                  id
                  email
                  name
                  role
                  avatarUrl
                }
                success
                message
              }
            }
          `,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { data, errors } = response.data;

        if (errors) {
          console.error("GraphQL 오류:", errors);
          return;
        }

        if (data?.getCurrentUser?.user) {
          setUser(data.getCurrentUser.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
        setUser(null);
        return;
      }
    };

    loadUser();
  }, [accessToken, setUser]); // 의존성 배열에 setUser가 포함됨

  return children;
}
