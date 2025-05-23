// utils/api.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true,  // 쿠키 자동 전송
});

// 요청 인터셉터 - 토큰 체크 및 갱신
api.interceptors.request.use(
  async (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      try {
        const refreshResponse = await axios.post(
          '/api/graphql',
          {
            query: `
              mutation {
                refreshToken {
                  accessToken
                  user {
                    id
                    email
                    role
                    name
                  }
                  success
                  message
                }
              }
            `,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );

        const { data, errors } = refreshResponse.data;
        if (errors || !data?.refreshToken?.accessToken) {
          useAuthStore.getState().logout();
          return Promise.reject(new Error("Token refresh failed"));
        }

        // 새 Access Token을 Zustand store에 저장
        useAuthStore.getState().setAccessToken(data.refreshToken.accessToken);
        useAuthStore.getState().setUser(data.refreshToken.user);
        config.headers.Authorization = `Bearer ${data.refreshToken.accessToken}`;
        config.withCredentials = true;
      } catch (error) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    } else {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export { api };