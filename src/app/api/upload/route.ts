import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, message: "파일이 없습니다." }, { status: 400 })
    }

    // 파일 확장자 추출
    const fileExtension = file.name.split(".").pop() || ""

    // 고유한 파일명 생성
    const fileName = `${uuidv4()}.${fileExtension}`

    // 파일 버퍼로 변환
    const buffer = await file.arrayBuffer()

    // Supabase Storage에 파일 업로드
    const { data, error } = await supabase.storage
      .from("blog-uploads") // 버킷 이름
      .upload(`images/${fileName}`, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("Supabase Storage 업로드 오류:", error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    // 파일 URL 생성
    const { data: urlData } = supabase.storage.from("blog-uploads").getPublicUrl(`images/${fileName}`)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error: any) {
    console.error("파일 업로드 오류:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
