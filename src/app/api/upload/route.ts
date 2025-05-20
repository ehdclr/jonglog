import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { nanoid } from "nanoid"
import path from "path"

// 파일 저장 경로 설정
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 })
  }

  try {
    // 업로드 디렉토리가 없으면 생성
    try {
      await mkdir(UPLOAD_DIR, { recursive: true })
    } catch (error) {
      console.log("디렉토리가 이미 존재하거나 생성할 수 없습니다.")
    }

    // 파일 확장자 추출
    const fileExtension = file.name.split(".").pop() || ""
    const fileName = `${nanoid()}.${fileExtension}`
    const filePath = path.join(UPLOAD_DIR, fileName)
    
    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // 파일 저장
    await writeFile(filePath, buffer)
    
    // 파일 URL 생성 (public 폴더 기준)
    const fileUrl = `/uploads/${fileName}`
    
    // 파일 타입 확인 (이미지인지 아닌지)
    const isImage = file.type.startsWith("image/")

    return NextResponse.json({
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      isImage,
    })
  } catch (error) {
    console.error("파일 업로드 오류:", error)
    return NextResponse.json({ error: "파일 업로드 중 오류가 발생했습니다." }, { status: 500 })
  }
}
