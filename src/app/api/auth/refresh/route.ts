// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql'

export async function POST(request: NextRequest) {
  // 쿠키에서 refresh token 가져오기
  const cookieStore = cookies()
  const refreshToken = cookieStore.get('refreshToken')?.value

  
  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: 'Refresh token not found' },
      { status: 401 }
    )
  }
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refreshToken=${refreshToken}`
      },
      body: JSON.stringify({
        query: `
          mutation refreshToken {
            refreshToken {
              accessToken
              success
            }
          }
        `,
        variables: {
          refreshToken: refreshToken
        }
      })
    })
    
    const { data, errors } = await response.json()
    if (errors) {
      return NextResponse.json(
        { success: false, message: errors[0].message },
        { status: 400 }
      )
    }
    
    // GraphQL 서버에서 설정한 쿠키가 있으면 클라이언트에 전달
    const setCookieHeader = response.headers.get('set-cookie')
    const nextResponse = NextResponse.json(data.refreshToken)
    
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader)
    }
    
    return nextResponse
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || '토큰 갱신에 실패했습니다.' },
      { status: 500 }
    )
  }
}