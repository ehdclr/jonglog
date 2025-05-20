"use client"
import Image from "next/image"
import { X, FileText, FileImage, FileIcon as FilePdf, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import useEmblaCarousel from "embla-carousel-react"

interface FileData {
  url: string
  fileName: string
  fileSize: number
  fileType: string
  isImage: boolean
  insertedToMarkdown?: boolean
}

interface FilePreviewProps {
  files: FileData[]
  onRemoveFile: (url: string) => void
  onInsertToMarkdown: (url: string, fileName: string) => void
}

export function FilePreview({ files, onRemoveFile, onInsertToMarkdown }: FilePreviewProps) {
  const [emblaRef] = useEmblaCarousel()

  // 파일 크기를 읽기 쉬운 형식으로 변환
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
  }

  // 파일 타입에 따른 아이콘 선택
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <FileImage className="h-6 w-6" />
    if (fileType === "application/pdf") return <FilePdf className="h-6 w-6" />
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return <FileSpreadsheet className="h-6 w-6" />
    return <FileText className="h-6 w-6" />
  }

  // 이미지 파일과 비이미지 파일 분리
  const imageFiles = files.filter((file) => file.isImage)
  const otherFiles = files.filter((file) => !file.isImage)

  return (
    <div className="space-y-6">
      {/* 이미지 카루셀 */}
      {imageFiles.length > 0 && (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {imageFiles.map((file) => (
              <div
                key={file.url}
                className="relative min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] p-2"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg border">
                  <Image src={file.url || "/placeholder.svg"} alt={file.fileName} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors">
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                        onClick={() => onInsertToMarkdown(file.url, file.fileName)}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">마크다운에 삽입</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-red-500"
                        onClick={() => onRemoveFile(file.url)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">삭제</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 truncate">{file.fileName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 비이미지 파일 목록 */}
      {otherFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">첨부 파일</h3>
          <div className="space-y-2">
            {otherFiles.map((file) => (
              <div key={file.url} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.fileType)}
                  <div>
                    <p className="text-sm font-medium">{file.fileName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onInsertToMarkdown(file.url, file.fileName)}>
                    삽입
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => onRemoveFile(file.url)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
