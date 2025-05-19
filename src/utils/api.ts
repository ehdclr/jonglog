// src/utils/api.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth-store";
import { parseCookies, setCookie } from 'nookies'; // nookies 라이브러리 설치 필요

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true, // 쿠키 사용 설정
});

// 요청 인터셉터 - Access Token 추가
api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 갱신
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 쿠키에서 refreshToken 가져오기
        const cookies = parseCookies();
        const refreshToken = cookies.refreshToken;

        if (!refreshToken) {
          // refreshToken이 없으면 로그아웃 처리
          await useAuthStore.getState().logout();
          return Promise.reject(new Error("Refresh token not found"));
        }

        // 토큰 갱신 요청
        const refreshResponse = await axios.post(
          '/api/refreshToken', // Next.js API 라우트 경로 (예시)
          {
            query: `
              mutation refreshToken($refreshToken: String!) {
                refreshToken(refreshToken: $refreshToken) {
                  accessToken
                  user {
                    id
                    email
                    name
                    role
                  }
                  success
                  message
                }
              }
            `,
            variables: {
              refreshToken,
            },
          },
          {
            withCredentials: true, // 쿠키를 포함하여 요청
          }
        );

        const { data, errors } = refreshResponse.data;

        if (errors) {
          // GraphQL 에러 처리
          console.error("Token refresh failed:", errors);
          await useAuthStore.getState().logout();
          return Promise.reject(new Error("Token refresh failed"));
        }

        if (data?.refreshToken?.accessToken) {
          // 새 Access Token 저장
          const accessToken = data.refreshToken.accessToken;
          localStorage.setItem("accessToken", accessToken);
          useAuthStore.getState().setAccessToken(accessToken); // 상태 관리 시스템에 저장

          // 새 Refresh Token 저장 (쿠키에 저장)
          if (data.refreshToken.refreshToken) {
            setCookie(null, 'refreshToken', data.refreshToken.refreshToken, { // nookies 사용
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 1000 * 60 * 60 * 24 * 30, // 30일
              path: '/', // 필요한 경우 경로 설정
            });
          }

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        } else {
          // 토큰 갱신 실패 시 로그아웃 처리
          await useAuthStore.getState().logout();
          return Promise.reject(new Error("Token refresh failed: No tokens received"));
        }
      } catch (refreshError: any) {
        console.error("Token refresh error:", refreshError);
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api };