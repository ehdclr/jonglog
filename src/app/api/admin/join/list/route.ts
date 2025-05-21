import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql";

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const authorization = request.headers.get("authorization");
  

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
        Authorization: `${authorization}`,
      },
      body: JSON.stringify({
        query: `
          query {
            signUpRequests {
              success
              message
              signUpRequests {
                id
                email
                name
                status
                createdAt
                updatedAt
                expiresAt
              }
            }
          }
        `,
      }),
    });
    const { data, errors } = await response.json();
    const res = data.signUpRequests;
    if (!res.success) {
      throw new Error(res.message);
    }

    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || "조회 중 오류가 발생했습니다.",
    });
  }
}
