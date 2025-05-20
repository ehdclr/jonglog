// src/components/header.tsx
"use client"

import ModeToggle from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Search, Menu, User, Settings, LogOut, UserPlus } from 'lucide-react'
import Link from "next/link"
import { useAuthStore, useUIStore } from "@/store"

export function Header() {
  const { user, isAdmin, logout } = useAuthStore()
  const { toggleSidebar } = useUIStore()

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">개인 블로그</h1>
        <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline-block">검색</span>
        </Button>
        {user?.role !== "owner" && user?.role !== "admin" && (
          <Link href="/join/join-request" className="ml-auto h-8 gap-1">
            <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline-block">가입 요청</span>
            </Button>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {user.role === "owner" ? "블로그 주인" : "사용자"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  프로필
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    관리자
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="flex items-center cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/login">로그인</Link>
          </Button>
        )}
      </div>
    </header>
  )
}