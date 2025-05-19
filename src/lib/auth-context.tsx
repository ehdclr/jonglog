"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  GET_CURRENT_USER,
} from "@/graphql/auth";

type User = {
  id: string;
  email: string;
  name?: string;
  role: "OWNER" | "ADMIN";
  avatarUrl?: string;
  bio?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // 토큰 초기화 (로컬 스토리지 또는 쿠키에서)
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  // 현재 사용자 정보 가져오기
  const { loading: userLoading, refetch } = useQuery(GET_CURRENT_USER, {
    skip: !token, // 토큰이 없으면 쿼리 실행 안 함
    context: {
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      },
    },
    onCompleted: (data) => {
      if (data?.getCurrentUser) {
        // GraphQL 스키마에 따라 필드 이름이 'me'일 가능성이 높음
        setUser(data.getCurrentUser);
      }
    },
    onError: (error) => {
      console.error("사용자 정보 조회 오류:", error);
      // 토큰이 유효하지 않은 경우 로그아웃 처리
      if (
        error.message.includes("Unauthorized") ||
        error.message.includes("Invalid token")
      ) {
        handleLogout();
      }
      setUser(null);
    },
  });

  // 로그인 뮤테이션
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);

  // 로그아웃 뮤테이션
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          loginInput: { email, password },
        },
      });
  
      if (data?.login?.success) {
        // 토큰 저장
        if (data.login.accessToken) {
          localStorage.setItem("accessToken", data.login.accessToken);
          setToken(data.login.accessToken);
        }
  
        setUser(data.login.user);
        await refetch(); 
        return { success: true, message: data.login.message };
      }
  
      return {
        success: false,
        message: data?.login?.message || "로그인에 실패했습니다.",
      };
    } catch (error: unknown) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "로그인에 실패했습니다.",
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
  };

  const logout = async () => {
    try {
      await logoutMutation({
        context: {
          headers: {
            authorization: token ? `Bearer ${token}` : "",
          },
        },
      });
      handleLogout();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      // 오류가 발생해도 클라이언트 측에서는 로그아웃 처리
      handleLogout();
    }
  };

  const isAdmin = user?.role === "OWNER" || user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: userLoading || loginLoading,
        login,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
