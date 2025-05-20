// 파일 저장소 추상화 레이어
// 나중에 S3로 쉽게 마이그레이션할 수 있도록 인터페이스 설계

import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import { nanoid } from "nanoid"

// 파일 저장소 인터페이스 정의
export interface FileStorage {
  saveFile(file: File): Promise<FileInfo>
  deleteFile(fileUrl: string): Promise<boolean>
}

// 파일 정보 인터페이스
export interface FileInfo {
  url: string
  fileName: string
  fileSize: number
  fileType: string
  isImage: boolean
}

// 로컬 파일 저장소 구현
export class LocalFileStorage implements FileStorage {
  private uploadDir: string

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads")
    this.ensureUploadDir()
  }

  private async ensureUploadDir() {
    try {
      await mkdir(this.uploadDir, { recursive: true })
    } catch (error) {
      console.log("디렉토리가 이미 존재하거나 생성할 수 없습니다.")
    }
  }

  async saveFile(file: File): Promise<FileInfo> {
    // 파일 확장자 추출
    const fileExtension = file.name.split(".").pop() || ""
    const fileName = `${nanoid()}.${fileExtension}`
    const filePath = path.join(this.uploadDir, fileName)

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 파일 저장
    await writeFile(filePath, buffer)

    // 파일 URL 생성 (public 폴더 기준)
    const fileUrl = `/uploads/${fileName}`

    return {
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      isImage: file.type.startsWith("image/"),
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // URL에서 파일 이름 추출
      const fileName = fileUrl.split("/").pop()
      if (!fileName) return false

      const filePath = path.join(this.uploadDir, fileName)
      await unlink(filePath)
      return true
    } catch (error) {
      console.error("파일 삭제 오류:", error)
      return false
    }
  }
}

// S3 파일 저장소 구현 (나중에 구현)
export class S3FileStorage implements FileStorage {
  async saveFile(file: File): Promise<FileInfo> {
    // S3에 파일 업로드 로직 구현 (나중에)
    throw new Error("아직 구현되지 않았습니다.")
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    // S3에서 파일 삭제 로직 구현 (나중에)
    throw new Error("아직 구현되지 않았습니다.")
  }
}

// 현재 사용할 파일 저장소 인스턴스 생성
export function getFileStorage(): FileStorage {
  // 환경 변수에 따라 다른 저장소 사용 가능
  // process.env.STORAGE_TYPE === 's3' ? new S3FileStorage() : new LocalFileStorage()
  return new LocalFileStorage()
}
