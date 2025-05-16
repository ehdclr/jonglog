"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

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
  }
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null)

  useEffect(() => {
    // 실제로는 API 호출로 데이터를 가져와야 함
    setPost(getPost(params.id))
  }, [params.id])

  if (!post) {
    return <div className="container max-w-4xl py-6">로딩 중...</div>
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
      </div>
    </div>
  )
}
