"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store"

// 가상의 게시물 데이터
const dummyPosts = [
  {
    id: 1,
    title: "Next.js 14 업데이트 내용 정리",
    excerpt: "Next.js 14에서 추가된 새로운 기능과 개선사항에 대해 정리해보았습니다.",
    date: "2023-05-15",
    category: "개발",
    isPublic: true,
  },
  {
    id: 2,
    title: "개인 블로그 개발 일지 #1",
    excerpt: "개인 블로그를 개발하면서 겪은 문제점과 해결 방법에 대한 기록입니다.",
    date: "2023-05-10",
    category: "개발",
    isPublic: true,
  },
  {
    id: 3,
    title: "주말 여행 계획",
    excerpt: "다음 주말에 계획 중인 여행 일정과 준비물 목록입니다.",
    date: "2023-05-08",
    category: "여행",
    isPublic: false,
  },
  {
    id: 4,
    title: "5월 독서 목록",
    excerpt: "이번 달에 읽을 책 목록과 간단한 리뷰입니다.",
    date: "2023-05-01",
    category: "독서",
    isPublic: true,
  },
]

export function PostsList() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState(dummyPosts)
  const [filter, setFilter] = useState("all") // all, public, private

  const filteredPosts = posts.filter((post) => {
    if (filter === "all") return true
    if (filter === "public") return post.isPublic
    if (filter === "private") return !post.isPublic
    return true
  })

  const toggleVisibility = (id: number) => {
    setPosts(posts.map((post) => (post.id === id ? { ...post, isPublic: !post.isPublic } : post)))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            전체
          </Button>
          <Button variant={filter === "public" ? "default" : "outline"} size="sm" onClick={() => setFilter("public")}>
            공개
          </Button>
          {(user?.role === "owner" || user?.role === "admin") && (
            <Button variant={filter === "private" ? "default" : "outline"} size="sm" onClick={() => setFilter("private")}>
              비공개
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {post.date} · {post.category}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {post.isPublic ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        편집
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleVisibility(post.id)}>
                        {post.isPublic ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            비공개로 전환
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            공개로 전환
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
            </CardContent>
            <CardFooter className="pt-2">
              <Badge variant={post.isPublic ? "default" : "outline"}>{post.isPublic ? "공개" : "비공개"}</Badge>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
