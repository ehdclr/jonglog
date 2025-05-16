"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, X, ImageIcon } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MarkdownEditor } from "@/components/markdown-editor"

export default function NewPostPage() {
  const [isPublic, setIsPublic] = useState(true)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [markdownContent, setMarkdownContent] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB",
        type: file.type,
        file: file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      }))
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB",
        type: file.type,
        file: file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      }))
      setUploadedFiles([...uploadedFiles, ...newFiles])
    }
  }

  const removeFile = (id) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id))
  }

  const insertImageToEditor = (file) => {
    // 마크다운에 이미지 삽입
    // 실제 구현에서는 이미지 URL을 생성하고 마크다운에 삽입
    const imageUrl = file.preview || "/placeholder.svg"
    const imageMarkdown = `![${file.name}](${imageUrl})\n`
    setMarkdownContent(markdownContent + imageMarkdown)
  }

  // 이미지 업로드 핸들러 (실제로는 Supabase Storage에 업로드)
  const handleImageUpload = async (file) => {
    // 실제 구현에서는 Supabase Storage에 업로드하고 URL 반환
    // 여기서는 임시로 미리보기 URL 반환
    return URL.createObjectURL(file)
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
        <h1 className="text-3xl font-bold">새 게시물 작성</h1>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">제목</Label>
            <Input id="title" placeholder="게시물 제목을 입력하세요" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">카테고리</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">개발</SelectItem>
                <SelectItem value="daily">일상</SelectItem>
                <SelectItem value="travel">여행</SelectItem>
                <SelectItem value="cooking">요리</SelectItem>
                <SelectItem value="reading">독서</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">내용</Label>
            <MarkdownEditor
              value={markdownContent}
              onChange={setMarkdownContent}
              placeholder="마크다운으로 게시물을 작성하세요..."
              onImageUpload={handleImageUpload}
            />
          </div>

          <div className="grid gap-2">
            <Label>파일 첨부</Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">파일을 여기에 끌어다 놓거나 클릭하여 업로드하세요</p>
                <Input type="file" className="hidden" id="file-upload" multiple onChange={handleFileChange} />
                <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload").click()}>
                  파일 선택
                </Button>
              </div>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="grid gap-2">
              <Label>업로드된 파일</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedFiles.map((file) => (
                  <Card key={file.id} className="overflow-hidden">
                    <CardContent className="p-2">
                      <div className="relative">
                        <div className="absolute top-0 right-0 p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-background/80"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {file.preview ? (
                          <div className="relative aspect-square">
                            <img
                              src={file.preview || "/placeholder.svg"}
                              alt={file.name}
                              className="object-cover w-full h-full rounded"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded">
                              <Button variant="secondary" size="sm" onClick={() => insertImageToEditor(file)}>
                                본문에 삽입
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center aspect-square bg-muted rounded">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="mt-2 text-xs truncate">{file.name}</div>
                        <div className="text-xs text-muted-foreground">{file.size}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="public">공개 게시물</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">임시 저장</Button>
            <Button>게시하기</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
