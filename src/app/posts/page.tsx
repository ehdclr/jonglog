"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react"

// 포스트 타입 정의
interface Post {
  id: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  author: {
    name: string
    avatar: string
  }
  publishedAt: string
  status: "published" | "draft"
  readingTime: string
  imageUrl?: string
}

// 임시 데이터
const MOCK_POSTS: Post[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `post-${i + 1}`,
  title: `Next.js 14 업데이트 내용 정리`,
  excerpt: "Next.js 14에서 추가된 새로운 기능과 개선사항에 대해 정리해보았습니다.",
  category: i % 3 === 0 ? "독서" : i % 3 === 1 ? "여행" : "개발",
  tags: ["독서", "여행", "개발"].slice(0, (i % 3) + 1),
  author: {
    name: "개발자",
    avatar: `/placeholder.svg?height=40&width=40&query=avatar${i}`,
  },
  publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
  status: i % 4 === 0 ? "draft" : "published",
  readingTime: `${Math.floor(Math.random() * 10) + 2}분`,
  imageUrl: i % 2 === 0 ? `/placeholder.svg?height=200&width=400&query=post${i}` : undefined,
}))

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("전체")
  const postsPerPage = 6

  // 데이터 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(MOCK_POSTS)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // 필터링된 포스트
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter
    const matchesStatus = statusFilter === "all" || post.status === statusFilter
    const matchesTab =
      activeTab === "전체" ||
      (activeTab === "개발" && post.category === "개발") ||
      (activeTab === "여행" && post.category === "여행") ||
      (activeTab === "독서" && post.category === "독서")

    return matchesSearch && matchesCategory && matchesStatus && matchesTab
  })

  // 페이지네이션
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 탭 변경 핸들러
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  return (
    <div className="flex-1 p-4 md:p-6">
      {/* 상단 제목 및 탭 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">주제</h1>
        <p className="text-muted-foreground mb-4">총 {filteredPosts.length}개의 게시물</p>

        <div className="flex space-x-2 mb-6">
          <Button
            variant={activeTab === "전체" ? "default" : "outline"}
            onClick={() => handleTabChange("전체")}
            className="rounded-md"
          >
            전체
            <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
              {posts.length}
            </span>
          </Button>
          <Button
            variant={activeTab === "개발" ? "default" : "outline"}
            onClick={() => handleTabChange("개발")}
            className="rounded-md"
          >
            개발
            <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
              {posts.filter((p) => p.category === "개발").length}
            </span>
          </Button>
          <Button
            variant={activeTab === "여행" ? "default" : "outline"}
            onClick={() => handleTabChange("여행")}
            className="rounded-md"
          >
            여행
            <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
              {posts.filter((p) => p.category === "여행").length}
            </span>
          </Button>
          <Button
            variant={activeTab === "독서" ? "default" : "outline"}
            onClick={() => handleTabChange("독서")}
            className="rounded-md"
          >
            독서
            <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
              {posts.filter((p) => p.category === "독서").length}
            </span>
          </Button>
        </div>
      </div>

      {/* 게시물 목록 */}
      {loading ? (
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : currentPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">게시물을 찾을 수 없습니다</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md">
            검색어나 필터를 변경하여 다시 시도하거나, 새 게시물을 작성해보세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {currentPosts.map((post) => (
            <div key={post.id} className="border rounded-lg overflow-hidden hover:bg-muted/30 transition-colors">
              <Link href={`/posts/${post.id}`} className="block p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {post.imageUrl && (
                    <div className="md:w-48 h-32 overflow-hidden rounded-md flex-shrink-0">
                      <img
                        src={post.imageUrl || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author.avatar || "/placeholder.svg"}
                          alt={post.author.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs text-muted-foreground">{post.author.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {filteredPosts.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
