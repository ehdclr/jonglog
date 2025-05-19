// src/app/api/graphql/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql";


export async function POST(request: NextRequest) {
  const body = await request.json();

 // 쿠키에서 refresh token 가져오기
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // 요청 헤더에서 authorization 토큰 가져오기
  const authorization = request.headers.get("authorization");

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
        ...(refreshToken ? { Cookie: `refresh_token=${refreshToken}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('asdasd',data.data.getCurrentUser.user);
    

    // GraphQL 서버에서 설정한 쿠키가 있으면 클라이언트에 전달
    const setCookieHeader = response.headers.get("set-cookie");
    const nextResponse = NextResponse.json(data);

    if (setCookieHeader) {
      nextResponse.headers.set("set-cookie", setCookieHeader);
    }

    return nextResponse;
  } catch (error: any) {
    return NextResponse.json(
      { errors: [{ message: error.message }] },
      { status: 500 }
    );
  }
}
