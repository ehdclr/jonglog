"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, X, FileIcon, FileText, FileIcon as FilePdf } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MarkdownEditor } from "@/components/markdown-editor"

export default function NewPostPage() {
  const [isPublic, setIsPublic] = useState(true)
  const [markdownContent, setMarkdownContent] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [carouselImages, setCarouselImages] = useState([])
  const [attachments, setAttachments] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  // 파일 업로드 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files))
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
      processFiles(Array.from(e.dataTransfer.files))
    }
  }

  // 파일 처리 및 분류
  const processFiles = (files: File[]) => {
    const newImages: any[] = []
    const newAttachments: any[] = []

    files.forEach((file) => {
      const fileObj = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB",
        type: file.type,
        file: file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      }

      if (file.type.startsWith("image/")) {
        newImages.push(fileObj)
      } else {
        newAttachments.push(fileObj)
      }
    })

    setCarouselImages([...carouselImages, ...newImages])
    setAttachments([...attachments, ...newAttachments])
  }

  const removeCarouselImage = (id: string) => {
    setCarouselImages(carouselImages.filter((image) => image.id !== id))
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id))
  }

  // 마크다운 에디터에 이미지 삽입
  const insertImageToEditor = (file: any) => {
    const imageUrl = file.preview || "/placeholder.svg"
    const imageMarkdown = `![${file.name}](${imageUrl})\n`
    setMarkdownContent(markdownContent + imageMarkdown)
  }

  // 이미지 업로드 핸들러 (실제로는 Supabase Storage에 업로드)
  const handleImageUpload = async (file: File) => {
    // 실제 구현에서는 Supabase Storage에 업로드하고 URL 반환
    return URL.createObjectURL(file)
  }

  // 파일 아이콘 선택
  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FilePdf className="h-8 w-8" />
    if (type.includes("text")) return <FileText className="h-8 w-8" />
    return <FileIcon className="h-8 w-8" />
  }

  // 게시물 저장
  const savePost = (isDraft = false) => {
    const post = {
      title,
      category,
      content: markdownContent,
      isPublic,
      isDraft,
      carouselImages,
      attachments,
      createdAt: new Date().toISOString(),
    }

    console.log("저장된 게시물:", post)
    // 실제로는 여기서 Supabase에 저장
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
            <Input
              id="title"
              placeholder="게시물 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={category} onValueChange={setCategory}>
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
            <Label>캐러셀 이미지 및 첨부 파일</Label>
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">파일을 여기에 끌어다 놓거나 클릭하여 업로드하세요</p>
                <p className="text-xs text-muted-foreground">
                  이미지는 캐러셀에 표시되고, 다른 파일은 첨부 파일로 표시됩니다
                </p>
                <Input type="file" className="hidden" id="file-upload" multiple onChange={handleFileChange} />
                <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                  파일 선택
                </Button>
              </div>
            </div>
          </div>

          {carouselImages.length > 0 && (
            <div className="grid gap-2">
              <Label>캐러셀 이미지 ({carouselImages.length}개)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {carouselImages.map((image: any) => (
                  <Card key={image.id} className="overflow-hidden">
                    <CardContent className="p-2">
                      <div className="relative">
                        <div className="absolute top-0 right-0 p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-background/80"
                            onClick={() => removeCarouselImage(image.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="relative aspect-square">
                          <img
                            src={image.preview || "/placeholder.svg"}
                            alt={image.name}
                            className="object-cover w-full h-full rounded"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded">
                            <Button variant="secondary" size="sm" onClick={() => insertImageToEditor(image)}>
                              본문에도 삽입
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs truncate">{image.name}</div>
                        <div className="text-xs text-muted-foreground">{image.size}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {attachments.length > 0 && (
            <div className="grid gap-2">
              <Label>첨부 파일 ({attachments.length}개)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {attachments.map((file: any) => (
                  <Card key={file.id} className="overflow-hidden">
                    <CardContent className="p-2">
                      <div className="relative">
                        <div className="absolute top-0 right-0 p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-background/80"
                            onClick={() => removeAttachment(file.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-center aspect-square bg-muted rounded">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="mt-2 text-xs truncate">{file.name}</div>
                        <div className="text-xs text-muted-foreground">{file.size}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="content">본문 내용</Label>
            <MarkdownEditor
              value={markdownContent}
              onChange={setMarkdownContent}
              placeholder="마크다운으로 게시물을 작성하세요..."
              onImageUpload={handleImageUpload}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="public">공개 게시물</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => savePost(true)}>
              임시 저장
            </Button>
            <Button onClick={() => savePost(false)}>게시하기</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
