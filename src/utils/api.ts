import axios from "axios";
import { useAuthStore } from "@/store/auth-store";
import { parseCookies, setCookie } from 'nookies';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true,
});

// 요청 인터셉터 - Access Token 추가
api.interceptors.request.use(
  async (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("accessToken", accessToken);
    } else {
      const cookies = parseCookies();
      const refreshToken = cookies.refreshToken;
      console.log("refreshToken", cookies);

      if (!refreshToken) {
        await useAuthStore.getState().logout();
        return Promise.reject(new Error("Refresh token not found"));
      }
      // GraphQL mutation 요청 (refreshToken은 쿠키에서 읽으므로 인자 없이)
      const refreshResponse = await axios.post(
        '/api/graphql',
        {
          query: `
            mutation {
              refreshToken {
                accessToken
                refreshToken
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
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
        );
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// // 응답 인터셉터 - 토큰 갱신
// api.interceptors.response.use(
//   (response: any) => response,
//   async (error: any) => {
//     const originalRequest = error.config;

//     // 401 에러이고 재시도하지 않은 경우
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         // 쿠키에서 refreshToken 가져오기
        // const cookies = parseCookies();
        // const refreshToken = cookies.refreshToken;

        // console.log("refreshToken", refreshToken);

        // if (!refreshToken) {
        //   await useAuthStore.getState().logout();
        //   return Promise.reject(new Error("Refresh token not found"));
        // }

        // // GraphQL mutation 요청 (refreshToken은 쿠키에서 읽으므로 인자 없이)
        // const refreshResponse = await axios.post(
        //   '/api/graphql',
        //   {
        //     query: `
        //       mutation {
        //         refreshToken {
        //           accessToken
        //           refreshToken
        //           user {
        //             id
        //             email
        //             name
        //             role
        //           }
        //           success
        //           message
        //         }
        //       }
        //     `,
        //   },
        //   {
        //     withCredentials: true,
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //   }
        // );

//         const { data, errors } = refreshResponse.data;

//         if (errors || !data?.refreshToken?.accessToken) {
//           await useAuthStore.getState().logout();
//           return Promise.reject(new Error("Token refresh failed"));
//         }

//         // 새 Access Token 저장
//         const accessToken = data.refreshToken.accessToken;
//         useAuthStore.getState().setAccessToken(accessToken);
//         localStorage.setItem("accessToken", accessToken);

//         // 새 Refresh Token 저장 (있으면)
//         if (data.refreshToken.refreshToken) {
//           setCookie(null, 'refreshToken', data.refreshToken.refreshToken, {
//             // httpOnly는 서버에서만 설정 가능, 클라이언트에서는 false
//             httpOnly: false,
//             secure: process.env.NODE_ENV === 'production',
//             maxAge: 60 * 60 * 24 * 30, // 30일
//             path: '/',
//           });
//         }

//         // 원래 요청 재시도
//         originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         return axios(originalRequest);
//       } catch (refreshError: any) {
//         await useAuthStore.getState().logout();
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export { api };