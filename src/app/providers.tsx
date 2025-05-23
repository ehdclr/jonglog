"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { user, accessToken, setUser } = useAuthStore();
  const { setBlogSettings } = useUIStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // 예: localStorage에 토큰이 있으면 서버에서 유저 정보 fetch
      if (accessToken && !user) {
        try {
          const res = await fetch("/api/auth/me", {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
    };

    initializeAuth();
  }, [accessToken, user, setUser]);

  useEffect(() => {
    const fetchBlogSettings = async () => {
      try {
        const response = await fetch("/api/config/blog-settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const { success, blogSettings, message } = await response.json();
        if (success) {
          setBlogSettings(blogSettings);
        } else {
          console.error(message);
          setBlogSettings({
            id: 'main_settings',
            blogName: 'JONG, DEV',
            blogDescription: 'JONG, DEV 블로그',
            isGithubPublic: false,
            isEmailPublic: false,
            isSnsPublic: false,
            logoUrl: '',
            contactEmail: '',
            githubUrl: '',
            snsUrl: '',
          });
        }
      } catch (error) {
        console.error("Failed to fetch blog settings:", error);
        setBlogSettings({
          id: "",
          blogName: "이현종 블로그",
          blogDescription: "이현종 블로그",
          isGithubPublic: false,
          isEmailPublic: false,
          isSnsPublic: false,
          logoUrl: "",
          githubUrl: "",
          contactEmail: "",
          snsUrl: "",
        });
      }
    };

    fetchBlogSettings();
  }, [setBlogSettings]);

  return <>{children}</>;
}