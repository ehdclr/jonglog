// src/components/sidebar.tsx
"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  FileText,
  FolderOpen,
  Home,
  Plus,
  Settings,
  BarChart,
  Users,
} from "lucide-react";
import { useAuthStore, useUIStore } from "@/store";


export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <div
      className={cn(
        "pb-12 border-r bg-background w-64 flex-shrink-0",
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />새 게시물
          </Button>
        </div>
        <div className="px-3">
          <div className="space-y-1">
            <Button
              variant={pathname === "/" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4" />홈
              </Link>
            </Button>
            <Button
              variant={pathname === "/posts" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/posts">
                <FileText className="h-4 w-4" />
                게시물
              </Link>
            </Button>
            <Button
              variant={pathname === "/files" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/files">
                <FolderOpen className="h-4 w-4" />
                파일
              </Link>
            </Button>
            <Button
              variant={pathname === "/calendar" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/calendar">
                <Calendar className="h-4 w-4" />
                달력
              </Link>
            </Button>
            <Button
              variant={pathname === "/activity" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/activity">
                <BarChart className="h-4 w-4" />
                활동
              </Link>
            </Button>
          </div>
        </div>

        {/* 관리자 전용 메뉴 */}
        {isAdmin && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              관리자 메뉴
            </h2>
            <div className="space-y-1">
              <Button
                variant={pathname === "/admin/posts" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href="/admin/posts">
                  <FileText className="h-4 w-4" />
                  게시물 관리
                </Link>
              </Button>
              <Button
                variant={pathname === "/admin/files" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href="/admin/files">
                  <FolderOpen className="h-4 w-4" />
                  파일 관리
                </Link>
              </Button>
              {user?.role === "owner" && (
                <Button
                  variant={pathname === "/admin/users" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <Link href="/admin/users">
                    <Users className="h-4 w-4" />
                    관리자 관리
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            카테고리
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1">
              {["개발", "일상", "여행", "요리", "독서"].map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                >
                  {category}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start font-normal text-muted-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />새 카테고리
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="mt-auto px-3 py-2">
        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            설정
          </Link>
        </Button>
      </div>
    </div>
  );
}
