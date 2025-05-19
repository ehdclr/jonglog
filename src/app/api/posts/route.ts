import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, categoryId, content, isPublic, isDraft, images, attachments } = body
    
    // 쿠키에서 refresh token 가져오기
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value
    
    // 요청 헤더에서 authorization 토큰 가져오기
    const authorization = request.headers.get('authorization')
    
    // GraphQL 뮤테이션 실행
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { 'Authorization': authorization } : {}),
        ...(refreshToken ? { 'Cookie': `refreshToken=${refreshToken}` } : {})
      },
      body: JSON.stringify({
        query: `
          mutation CreatePost($input: CreatePostInput!) {
            createPost(input: $input) {
              id
              title
              content
              isPublic
              isDraft
              createdAt
              category {
                id
                name
              }
              images {
                id
                url
                fileName
              }
              attachments {
                id
                url
                fileName
                fileType
                fileSize
              }
            }
          }
        `,
        variables: {
          input: {
            title,
            categoryId,
            content,
            isPublic,
            isDraft,
            images,
            attachments
          }
        }
      })
    })
    
    const data = await response.json()
    
    // GraphQL 오류 처리
    if (data.errors) {
      return NextResponse.json(
        { success: false, message: data.errors[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      post: data.data.createPost
    })
  } catch (error: any) {
    console.error('게시물 생성 오류:', error)
    return NextResponse.json(
      { success: false, message: error.message || '게시물 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}