"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Download,
  FileIcon,
  FileIcon as FilePdf,
  FileText,
} from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Card, CardContent } from "@/components/ui/card"

// 가상의 게시물 데이터 (실제로는 DB에서 가져와야 함)
const getPost = (id: string) => {
  return {
    id,
    title: "Next.js 14 업데이트 내용 정리",
    content: `
# Next.js 14 업데이트 내용 정리

Next.js 14가 출시되었습니다. 이번 업데이트에서는 다양한 성능 개선과 새로운 기능이 추가되었습니다.

## 주요 변경사항

1. **Server Actions 안정화**
   - 이제 Server Actions가 안정화 단계에 접어들었습니다.
   - 폼 제출 및 데이터 변경을 위한 API가 개선되었습니다.

2. **Partial Prerendering (기술 프리뷰)**
   - 정적 쉘과 동적 콘텐츠를 결합하는 새로운 렌더링 모델입니다.
   - 초기 페이지 로드 속도를 개선하면서도 동적 콘텐츠를 제공할 수 있습니다.

3. **성능 개선**
   - 빌드 시간이 최대 40% 단축되었습니다.
   - 메모리 사용량이 감소했습니다.

## 코드 예시

\`\`\`jsx
// app/page.js
export default function Page() {
  return (
    <main>
      <h1>Hello, Next.js 14!</h1>
    </main>
  )
}
\`\`\`

## 마이그레이션 가이드

Next.js 13에서 14로 업그레이드하는 방법은 다음과 같습니다:

\`\`\`bash
npm install next@latest react@latest react-dom@latest
\`\`\`

대부분의 애플리케이션은 별도의 코드 변경 없이 업그레이드가 가능합니다.

![Next.js 14 로고](/placeholder.svg?height=300&width=500&query=Next.js%2014%20Logo)
    `,
    date: "2023-05-15",
    category: "개발",
    isPublic: true,
    // 캐러셀 이미지 추가
    carouselImages: [
      {
        id: 1,
        name: "next-js-14-banner.jpg",
        url: "/placeholder-ly9md.png",
      },
      {
        id: 2,
        name: "server-actions.jpg",
        url: "/placeholder-tje58.png",
      },
      {
        id: 3,
        name: "partial-prerendering.jpg",
        url: "/placeholder-l1udc.png",
      },
    ],
    // 첨부 파일 추가
    attachments: [
      {
        id: 1,
        name: "next-js-14-release-notes.pdf",
        size: "1.2 MB",
        type: "application/pdf",
        url: "#",
      },
      {
        id: 2,
        name: "migration-guide.txt",
        size: "45 KB",
        type: "text/plain",
        url: "#",
      },
    ],
  }
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    // 실제로는 API 호출로 데이터를 가져와야 함
    setPost(getPost(params.id))
  }, [params.id])

  if (!post) {
    return <div className="container max-w-4xl py-6">로딩 중...</div>
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % post.carouselImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + post.carouselImages.length) % post.carouselImages.length)
  }

  // 파일 아이콘 선택
  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FilePdf className="h-5 w-5" />
    if (type.includes("text")) return <FileText className="h-5 w-5" />
    return <FileIcon className="h-5 w-5" />
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/posts" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge>{post.category}</Badge>
            <Badge variant={post.isPublic ? "default" : "outline"}>
              {post.isPublic ? (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  공개
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <EyeOff className="h-3 w-3" />
                  비공개
                </div>
              )}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <span>{post.date}</span>
          </div>
        </div>

        {/* 캐러셀 이미지 */}
        {post.carouselImages && post.carouselImages.length > 0 && (
          <div className="relative rounded-lg overflow-hidden">
            <div className="aspect-[16/9] bg-muted">
              <img
                src={post.carouselImages[currentImageIndex].url || "/placeholder.svg"}
                alt={post.carouselImages[currentImageIndex].name}
                className="w-full h-full object-cover"
              />
            </div>

            {post.carouselImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full h-8 w-8"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full h-8 w-8"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {post.carouselImages.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full ${
                        index === currentImageIndex ? "bg-primary" : "bg-background/80"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    ></div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 마크다운 콘텐츠 */}
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "")
                return !inline && match ? (
                  <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* 첨부 파일 */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="border-t pt-4 mt-8">
            <h3 className="text-lg font-medium mb-4">첨부 파일</h3>
            <div className="space-y-2">
              {post.attachments.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-xs text-muted-foreground">{file.size}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={file.url} download className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          다운로드
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
