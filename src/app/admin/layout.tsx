"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, accessToken, loading, isAdmin } = useAuthStore();
  const router = useRouter();

  if (user?.role !== "owner") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="ml-2">접근권한이 없습니다.</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
