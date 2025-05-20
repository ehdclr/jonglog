"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud } from "lucide-react"

interface FileUploadProps {
  onFileUploaded: (fileData: {
    url: string
    fileName: string
    fileSize: number
    fileType: string
    isImage: boolean
  }) => void
  onRemoveFile: (url: string) => void
}

export function FileUpload({ onFileUploaded, onRemoveFile }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        setIsUploading(true)

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

          const data = await response.json()
          onFileUploaded(data)
        } catch (error) {
          console.error("업로드 오류:", error)
          alert("파일 업로드 중 오류가 발생했습니다.")
        } finally {
          setIsUploading(false)
        }
      }
    },
    [onFileUploaded],
  )

  // 클립보드에서 이미지 붙여넣기 처리
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            event.preventDefault()

            const files = [file]
            await onDrop(files)
          }
        }
      }
    },
    [onDrop],
  )

  // 클립보드에서 이미지 붙여넣기 처리를 위한 이벤트 리스너
  useEffect(() => {
    // 브라우저 환경인지 확인
    if (typeof window !== "undefined") {
      document.addEventListener("paste", handlePaste)
      return () => {
        document.removeEventListener("paste", handlePaste)
      }
    }
  }, [handlePaste])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive ? "파일을 여기에 놓으세요..." : "파일을 드래그하거나 클릭하여 업로드하세요"}
        </p>
        <p className="mt-1 text-xs text-gray-500">또는 클립보드에서 이미지를 붙여넣으세요 (Ctrl+V)</p>
        {isUploading && (
          <div className="mt-4">
            <div className="animate-pulse text-sm text-gray-500">업로드 중...</div>
          </div>
        )}
      </div>
    </div>
  )
}
