import { type NextRequest, NextResponse } from "next/server"
import { getFileStorage } from "@/lib/file-storage"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 })
  }

  try {
    // 파일 저장소 인스턴스 가져오기
    const fileStorage = getFileStorage()

    // 파일 저장
    const fileInfo = await fileStorage.saveFile(file)

    return NextResponse.json(fileInfo)
  } catch (error) {
    console.error("파일 업로드 오류:", error)
    return NextResponse.json({ error: "파일 업로드 중 오류가 발생했습니다." }, { status: 500 })
  }
}
