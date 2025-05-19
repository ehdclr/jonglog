// src/utils/api.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true, // 쿠키 포함
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
        // 토큰 갱신 시도
        const refreshed = await useAuthStore.getState().refreshToken();

        if (refreshed) {
          // 새 Access Token으로 원래 요청 재시도
          const accessToken = useAuthStore.getState().accessToken;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        } else {
          // 토큰 갱신 실패 시 로그아웃
          await useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api };
