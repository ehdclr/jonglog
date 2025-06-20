import { NextRequest, NextResponse } from "next/server"

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql'

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json()
  

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
      mutation RequestSignUp($email: String!, $name: String!) {
        requestSignUp(email: $email, name: $name) {
            canResend
            expiresAt
            message
            status
            success
          }
        }
        `,
        variables: {
          email,
          name,
        },
      }),
    })

    const { data, errors } = await response.json()
    const res = data.requestSignUp;
    if(!res.success) {
      throw new Error(res.message)
    }

    return NextResponse.json(res)
  } catch (error: any) { 
    console.error('가입 요청 오류:', error)
    return NextResponse.json({
      success: false,
      message: error.message || '가입 요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
    }, { status: 500 })
  }
}