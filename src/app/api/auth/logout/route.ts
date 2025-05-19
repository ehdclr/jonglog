// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql'

export async function POST(request: NextRequest) {
  // 쿠키에서 refresh token 가져오기
  const cookieStore = cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value
  const authorization = request.headers.get('authorization')
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { 'Authorization': authorization } : {}),
        ...(refreshToken ? { 'Cookie': `refresh_token=${refreshToken}` } : {})
      },
      body: JSON.stringify({
        query: `
          mutation Logout {
            logout {
              success
              message
            }
          }
        `
      })
    })
    
    const { data, errors } = await response.json()
    
    if (errors) {
      return NextResponse.json(
        { success: false, message: errors[0].message },
        { status: 400 }
      )
    }
    
    // 응답에서 쿠키 제거 지시가 있으면 클라이언트 쿠키도 제거
    const nextResponse = NextResponse.json({ success: true })
    nextResponse.cookies.delete('refreshToken')
    
    return nextResponse
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || '로그아웃에 실패했습니다.' },
      { status: 500 }
    )
  }
}