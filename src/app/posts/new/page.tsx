"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, X, FileIcon, FileText, FileIcon as FilePdf, Trash2, Clock, Save } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MarkdownEditor } from "@/components/markdown-editor"
import { ImageCarousel } from "@/components/image-carousel"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

// 이미지 최적화 함수
const optimizeImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      let width = img.width
      let height = img.height

      // 최대 크기 제한
      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (maxHeight / height) * width
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }))
          }
        },
        file.type,
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// 서버에 파일 업로드 함수
const uploadFileToServer = async (file: File) => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("파일 업로드에 실패했습니다.")
    }

    return await response.json()
  } catch (error) {
    console.error("파일 업로드 오류:", error)
    throw error
  }
}

// 파일 타입 정의
type FileObject = {
  id: string
  name: string
  size: string
  type: string
  url: string
  preview: string | null
  isImage: boolean
}

// 임시 저장 게시물 타입 정의
type DraftPost = {
  id: string
  title: string
  category: string
  content: string
  isPublic: boolean
  carouselImages: Record<string, FileObject>
  imageOrder: string[]
  attachments: FileObject[]
  lastSaved: string
}

// 날짜 포맷 함수
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "방금 전"
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function CreatePostPage() {
  const [isPublic, setIsPublic] = useState(true)
  const [markdownContent, setMarkdownContent] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [carouselImages, setCarouselImages] = useState<Record<string, FileObject>>({})
  const [imageOrder, setImageOrder] = useState<string[]>([])
  const [currentImageId, setCurrentImageId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<FileObject[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [drafts, setDrafts] = useState<DraftPost[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()
  const initialLoadRef = useRef(false)

  // 로컬스토리지에서 임시 저장된 게시물 불러오기
  useEffect(() => {
    if (initialLoadRef.current) return
    initialLoadRef.current = true

    const draftId = new URLSearchParams(window.location.search).get("draftId")
    if (draftId) {
      const drafts = JSON.parse(localStorage.getItem("postDrafts") || "[]")
      const draft = drafts.find((d: DraftPost) => d.id === draftId)
      if (draft) {
        loadDraft(draft)
        setCurrentDraftId(draftId)
      }
    }
  }, [])

  // 임시 저장 목록 불러오기
  const loadDrafts = () => {
    const savedDrafts = JSON.parse(localStorage.getItem("postDrafts") || "[]")
    // 최신순으로 정렬
    savedDrafts.sort((a: DraftPost, b: DraftPost) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime())
    setDrafts(savedDrafts)
  }

  // 컴포넌트 마운트 시 임시 저장 목록 불러오기
  useEffect(() => {
    loadDrafts()
  }, [])

  // 변경 사항 감지
  useEffect(() => {
    if (initialLoadRef.current) {
      setHasChanges(true)
    }
  }, [title, category, markdownContent, isPublic, carouselImages, imageOrder, attachments])

  // 임시 저장 불러오기
  const loadDraft = (draft: DraftPost) => {
    setTitle(draft.title || "")
    setCategory(draft.category || "")
    setMarkdownContent(draft.content || "")
    setIsPublic(draft.isPublic ?? true)
    setCarouselImages(draft.carouselImages || {})
    setImageOrder(draft.imageOrder || [])
    setAttachments(draft.attachments || [])
    setCurrentDraftId(draft.id)

    if (draft.imageOrder?.length > 0) {
      setCurrentImageId(draft.imageOrder[0])
    }

    // 다이얼로그 닫기
    setIsDialogOpen(false)

    // 변경 사항 초기화
    setHasChanges(false)

    // 토스트 메시지 표시
    toast({
      title: "임시 저장 불러오기 완료",
      description: `'${draft.title || "제목 없음"}'을(를) 불러왔습니다.`,
    })
  }

  // 임시 저장 삭제 확인
  const confirmDeleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDraftToDelete(draftId)
  }

  // 임시 저장 삭제
  const deleteDraft = () => {
    if (!draftToDelete) return

    const updatedDrafts = drafts.filter((d) => d.id !== draftToDelete)
    localStorage.setItem("postDrafts", JSON.stringify(updatedDrafts))
    setDrafts(updatedDrafts)

    // 현재 편집 중인 임시 저장을 삭제한 경우
    if (draftToDelete === currentDraftId) {
      setCurrentDraftId(null)
    }

    setDraftToDelete(null)

    toast({
      title: "임시 저장 삭제 완료",
      description: "임시 저장이 삭제되었습니다.",
    })
  }

  // 임시 저장 함수
  const saveDraft = async () => {
    setIsSaving(true)

    try {
      const draftId = currentDraftId || `draft-${Date.now()}-${Math.random().toString(36).substring(7)}`

      const draft: DraftPost = {
        id: draftId,
        title,
        category,
        content: markdownContent,
        isPublic,
        carouselImages,
        imageOrder,
        attachments,
        lastSaved: new Date().toISOString(),
      }

      // 기존 임시 저장 목록 가져오기
      const drafts = JSON.parse(localStorage.getItem("postDrafts") || "[]")

      // 같은 ID의 임시 저장이 있으면 업데이트, 없으면 새로 추가
      const existingIndex = drafts.findIndex((d: DraftPost) => d.id === draftId)
      if (existingIndex >= 0) {
        drafts[existingIndex] = draft
      } else {
        drafts.push(draft)
      }

      // 최대 10개까지만 저장
      if (drafts.length > 10) {
        drafts.sort((a: DraftPost, b: DraftPost) => new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime())
        drafts.splice(10)
      }

      localStorage.setItem("postDrafts", JSON.stringify(drafts))
      setCurrentDraftId(draftId)
      loadDrafts()
      setHasChanges(false)

      toast({
        title: "임시 저장 완료",
        description: "작성 중인 게시물이 임시 저장되었습니다.",
      })
    } catch (error) {
      console.error("임시 저장 중 오류 발생:", error)
      toast({
        title: "임시 저장 실패",
        description: "임시 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 자동 저장 (5분마다)
  useEffect(() => {
    const autoSaveInterval = setInterval(
      () => {
        if ((title || markdownContent) && hasChanges) {
          saveDraft()
        }
      },
      5 * 60 * 1000,
    ) // 5분

    return () => clearInterval(autoSaveInterval)
  }, [title, markdownContent, category, isPublic, carouselImages, imageOrder, attachments, hasChanges])

  // 공통 파일 업로드 로직
  const uploadFile = async (file: File): Promise<FileObject> => {
    let processedFile = file
    if (file.type.startsWith("image/") && file.size > 1024 * 1024) {
      processedFile = await optimizeImage(file)
    }

    const uploadResult = await uploadFileToServer(processedFile)
    const uniqueId = `file-${Date.now()}-${Math.random().toString(36).substring(7)}`

    return {
      id: uniqueId,
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      type: file.type,
      url: uploadResult.url,
      preview: file.type.startsWith("image/") ? uploadResult.url : null,
      isImage: file.type.startsWith("image/"),
    }
  }

  // 파일 업로드 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(Array.from(e.target.files))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      await processFiles(Array.from(e.dataTransfer.files))
    }
  }

  // 여러 파일 처리
  const processFiles = async (files: File[]) => {
    setIsUploading(true)
    const newImages: FileObject[] = []
    const newAttachments: FileObject[] = []

    for (const file of files) {
      try {
        const fileObj = await uploadFile(file)
        if (fileObj.isImage) {
          newImages.push(fileObj)
        } else {
          newAttachments.push(fileObj)
        }
      } catch (error) {
        console.error("파일 처리 중 오류 발생:", error)
      }
    }

    // 이미지 상태 업데이트
    for (const image of newImages) {
      setCarouselImages((prev) => ({
        ...prev,
        [image.id]: image,
      }))
      setImageOrder((prev) => [...prev, image.id])

      if (!currentImageId) {
        setCurrentImageId(image.id)
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments])
    setIsUploading(false)
  }

  // 마크다운 에디터용 이미지 업로드
  const handleImageUpload = async (file: File) => {
    try {
      const fileObj = await uploadFile(file)
      setCarouselImages((prev) => ({ ...prev, [fileObj.id]: fileObj }))
      setImageOrder((prev) => [...prev, fileObj.id])
      return fileObj.url
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error)
      throw error
    }
  }

  const removeCarouselImage = async (id: string) => {
    try {
      const imageToRemove = carouselImages[id]
      if (imageToRemove?.url) {
        await fetch("/api/delete-file", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileUrl: imageToRemove.url }),
        })
      }
    } catch (error) {
      console.error("파일 삭제 오류:", error)
    }

    const newImages = { ...carouselImages }
    delete newImages[id]
    setCarouselImages(newImages)
    setImageOrder((prev) => prev.filter((imageId) => imageId !== id))

    if (currentImageId === id) {
      const newOrder = imageOrder.filter((imageId) => imageId !== id)
      if (newOrder.length > 0) {
        const currentIndex = imageOrder.indexOf(id)
        const nextIndex = Math.min(currentIndex, newOrder.length - 1)
        setCurrentImageId(newOrder[nextIndex])
      } else {
        setCurrentImageId(null)
      }
    }
  }

  const removeAttachment = async (id: string) => {
    try {
      const attachmentToRemove = attachments.find((att) => att.id === id)
      if (attachmentToRemove?.url) {
        await fetch("/api/delete-file", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileUrl: attachmentToRemove.url }),
        })
      }
    } catch (error) {
      console.error("파일 삭제 오류:", error)
    }

    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id))
  }

  const insertImageToEditor = (file: FileObject) => {
    const imageUrl = file.url || file.preview || "/placeholder.svg"
    const imageMarkdown = `![${file.name}](${imageUrl})\n`
    setMarkdownContent((prev) => prev + imageMarkdown)
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FilePdf className="h-8 w-8" />
    if (type.includes("text")) return <FileText className="h-8 w-8" />
    return <FileIcon className="h-8 w-8" />
  }

  // 게시물 저장 함수 수정
  const savePost = async (isDraft = false) => {
    if (!title.trim()) {
      toast({
        title: "제목 필요",
        description: "게시물 제목을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      if (isDraft) {
        await saveDraft()
        return
      }

      // 실제 게시인 경우 서버에 저장
      const post = {
        title,
        category,
        content: markdownContent,
        isPublic,
        isDraft,
        carouselImages: imageOrder.map((id) => {
          const img = carouselImages[id]
          return {
            id: img.id,
            name: img.name,
            type: img.type,
            size: img.size,
            url: img.url,
          }
        }),
        attachments: attachments.map((att) => ({
          id: att.id,
          name: att.name,
          type: att.type,
          size: att.size,
          url: att.url,
        })),
        createdAt: new Date().toISOString(),
      }

      const response = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
      })

      if (!response.ok) {
        throw new Error("게시물 저장에 실패했습니다.")
      }

      const result = await response.json()
      console.log("저장된 게시물:", result)

      // 게시 성공 시 해당 임시 저장 데이터 삭제
      if (currentDraftId) {
        const drafts = JSON.parse(localStorage.getItem("postDrafts") || "[]")
        const updatedDrafts = drafts.filter((d: DraftPost) => d.id !== currentDraftId)
        localStorage.setItem("postDrafts", JSON.stringify(updatedDrafts))
        loadDrafts()
      }

      toast({
        title: "게시 완료",
        description: "게시물이 성공적으로 등록되었습니다.",
      })

      // 게시 후 폼 초기화
      setTitle("")
      setCategory("")
      setMarkdownContent("")
      setIsPublic(true)
      setCarouselImages({})
      setImageOrder([])
      setAttachments([])
      setCurrentImageId(null)
      setCurrentDraftId(null)
      setHasChanges(false)
    } catch (error) {
      console.error("게시물 저장 중 오류 발생:", error)
      toast({
        title: "게시 실패",
        description: "게시물 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          e.preventDefault()
          await processFiles([file])
        }
      }
    }
  }

  const handleThumbnailClick = (id: string) => {
    setCurrentImageId(id)
  }

  return (
    <div className="container max-w-4xl py-6" onPaste={handlePaste}>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/posts" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {/* 임시 저장 버튼 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveDraft}
                  disabled={isSaving || (!title && !markdownContent)}
                  className={hasChanges ? "border-amber-500 text-amber-500" : ""}
                >
                  {isSaving ? (
                    <>저장 중...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      저장
                      {hasChanges && <span className="ml-1 text-xs">*</span>}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>작성 중인 내용을 임시 저장합니다</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 임시 저장 목록 다이얼로그 */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={loadDrafts}>
                <Clock className="h-4 w-4" />
                임시 저장 목록
                {drafts.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {drafts.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>임시 저장 목록</DialogTitle>
                <DialogDescription>최근에 임시 저장한 게시물 목록입니다. 불러올 게시물을 선택하세요.</DialogDescription>
              </DialogHeader>

              <ScrollArea className="h-[50vh] mt-4">
                {drafts.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">임시 저장된 게시물이 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {drafts.map((draft) => (
                      <Card key={draft.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4" onClick={() => loadDraft(draft)}>
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{draft.title || "제목 없음"}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{formatDate(draft.lastSaved)}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {draft.content
                                  ? draft.content.substring(0, 100) + (draft.content.length > 100 ? "..." : "")
                                  : "내용 없음"}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/80"
                              onClick={(e) => confirmDeleteDraft(draft.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!draftToDelete} onOpenChange={(open) => !open && setDraftToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>임시 저장 삭제</DialogTitle>
            <DialogDescription>이 임시 저장을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">취소</Button>
            </DialogClose>
            <Button variant="destructive" onClick={deleteDraft}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{currentDraftId ? "임시 저장 게시물 편집" : "새 게시물 작성"}</h1>
          {currentDraftId && (
            <div className="text-sm text-muted-foreground">
              마지막 저장:{" "}
              {formatDate(drafts.find((d) => d.id === currentDraftId)?.lastSaved || new Date().toISOString())}
            </div>
          )}
        </div>

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
                <p className="text-xs text-muted-foreground">클립보드에서 이미지를 붙여넣을 수도 있습니다 (Ctrl+V)</p>
                <Input type="file" className="hidden" id="file-upload" multiple onChange={handleFileChange} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "업로드 중..." : "파일 선택"}
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {imageOrder.length > 0 && (
              <motion.div
                className="grid gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <Label>캐러셀 이미지 ({imageOrder.length}개)</Label>
                </div>

                <ImageCarousel
                  images={imageOrder.map((id) => carouselImages[id])}
                  onInsertImage={insertImageToEditor}
                  currentImageId={currentImageId}
                  onImageSelect={setCurrentImageId}
                />

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {imageOrder.map((id) => {
                    const image = carouselImages[id]
                    return (
                      <motion.div
                        key={id}
                        className={`relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer ${
                          id === currentImageId ? "border-primary" : "border-transparent"
                        }`}
                        onClick={() => handleThumbnailClick(id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img
                          src={image.url || image.preview || "/placeholder.svg"}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/abstract-colorful-swirls.png"
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeCarouselImage(id)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                className="grid gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Label>첨부 파일 ({attachments.length}개)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {attachments.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
            <Button
              variant="outline"
              onClick={() => savePost(true)}
              disabled={isSaving}
              className={hasChanges ? "border-amber-500 text-amber-500" : ""}
            >
              {isSaving ? "저장 중..." : "임시 저장"}
              {hasChanges && <span className="ml-1 text-xs">*</span>}
            </Button>
            <Button onClick={() => savePost(false)}>게시하기</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
