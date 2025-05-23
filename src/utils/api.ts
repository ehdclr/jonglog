import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true,
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
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // refreshToken으로 새 accessToken 발급
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
                  }
                  success
                  message
                }
              }
            `,
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { data, errors } = refreshResponse.data;

        if (errors || !data?.refreshToken?.accessToken) {
          await useAuthStore.getState().logout();
          return Promise.reject(new Error("Token refresh failed"));
        }

        // 새 Access Token 저장
        const newAccessToken = data.refreshToken.accessToken;
        console.log("newAccessToken", newAccessToken);
        useAuthStore.getState().setAccessToken(newAccessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api };