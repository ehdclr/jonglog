// S3 파일 저장소 구현 (나중에 사용)
import type { FileStorage, FileInfo } from "./file-storage"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { nanoid } from "nanoid"

export class S3FileStorage implements FileStorage {
  private s3Client: S3Client
  private bucketName: string
  private region: string

  constructor() {
    this.region = process.env.AWS_REGION || "ap-northeast-2" // 기본값으로 서울 리전 사용
    this.bucketName = process.env.AWS_BUCKET_NAME || ""

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    })
  }

  async saveFile(file: File): Promise<FileInfo> {
    // 파일 확장자 추출
    const fileExtension = file.name.split(".").pop() || ""
    const fileName = `${nanoid()}.${fileExtension}`

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()

    // S3에 업로드
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type,
      ACL: "public-read", // 공개 접근 가능하도록 설정
    })

    await this.s3Client.send(command)

    // S3 URL 생성
    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`

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
      // URL에서 파일 이름(Key) 추출
      const fileName = fileUrl.split("/").pop()
      if (!fileName) return false

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      })

      await this.s3Client.send(command)
      return true
    } catch (error) {
      console.error("S3 파일 삭제 오류:", error)
      return false
    }
  }
}
