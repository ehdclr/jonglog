"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bold, Italic, List, ListOrdered, ImageIcon, LinkIcon, Code, Heading1, Heading2, Quote } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onImageUpload?: (file: File) => Promise<string>
}

export function MarkdownEditor({ value, onChange, placeholder, onImageUpload }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("write")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertText = (before: string, after = "") => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + before.length
      textarea.selectionEnd = start + before.length + selectedText.length
    }, 0)
  }

  const handleBold = () => insertText("**", "**")
  const handleItalic = () => insertText("*", "*")
  const handleH1 = () => insertText("# ")
  const handleH2 = () => insertText("## ")
  const handleList = () => insertText("- ")
  const handleOrderedList = () => insertText("1. ")
  const handleQuote = () => insertText("> ")
  const handleCode = () => insertText("```\n", "\n```")
  const handleLink = () => insertText("[링크 텍스트](", ")")

  const handleImage = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !onImageUpload) return

    try {
      const file = e.target.files[0]
      const imageUrl = await onImageUpload(file)
      insertText(`![${file.name}](${imageUrl})`)
    } catch (error) {
      console.error("이미지 업로드 실패:", error)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // 탭 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      insertText("  ")
    }
  }

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-2 border-b">
        <Button variant="ghost" size="icon" onClick={handleBold} title="굵게">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleItalic} title="기울임">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleH1} title="제목 1">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleH2} title="제목 2">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleList} title="목록">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleOrderedList} title="번호 목록">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleQuote} title="인용">
          <Quote className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleCode} title="코드">
          <Code className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLink} title="링크">
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleImage} title="이미지">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full rounded-none">
          <TabsTrigger value="write">작성</TabsTrigger>
          <TabsTrigger value="preview">미리보기</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="p-0 m-0">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "마크다운으로 작성하세요..."}
            className="w-full min-h-[400px] p-4 resize-y font-mono text-sm focus:outline-none bg-background"
            onKeyDown={handleKeyDown}
          />
        </TabsContent>

        <TabsContent value="preview" className="p-0 m-0">
          <div className="prose dark:prose-invert max-w-none p-4 min-h-[400px] overflow-auto">
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
              {value}
            </ReactMarkdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
