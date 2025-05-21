// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation Login($loginInput: LoginInput!) {
            login(loginInput: $loginInput) {
              user {
                id
                email
                name
                role
              }
              accessToken
              success
              message
            }
          }
        `,
        variables: {
          loginInput: {
            email,
            password
          }
        }
      })
    })
    
    const { data, errors } = await response.json()
    const res = data.login;

    if(!res.success) {
        throw new Error(res.message)
    }
    // GraphQL 서버에서 설정한 쿠키가 있으면 클라이언트에 전달
    const setCookieHeader = response.headers.get('set-cookie')
    const nextResponse = NextResponse.json(res)
    
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader)
    }

    return nextResponse
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || '로그인에 실패했습니다.' },
      { status: 500 }
    )
  }
}