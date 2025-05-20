import { type NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import path from "path"

export async function DELETE(request: NextRequest) {
  const { fileUrl } = await request.json()

  if (!fileUrl) {
    return NextResponse.json({ error: "파일 URL이 없습니다." }, { status: 400 })
  }

  try {
    // URL에서 파일 이름 추출
    const fileName = fileUrl.split("/").pop()
    if (!fileName) {
      return NextResponse.json({ error: "파일 이름을 추출할 수 없습니다." }, { status: 400 })
    }

    // 파일 경로 생성
    const filePath = path.join(process.cwd(), "public", "uploads", fileName)

    // 파일 삭제
    await unlink(filePath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("파일 삭제 오류:", error)
    return NextResponse.json({ error: "파일 삭제 중 오류가 발생했습니다." }, { status: 500 })
  }
}
