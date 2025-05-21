import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql";

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const { requestId } = params;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const authorization = request.headers.get("authorization");

  console.log("requestId", requestId);

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
        query CheckSignUpRequest($requestId: String!) {
            checkSignUpRequest(requestId: $requestId) {
              success
              message
              signUpRequest {
            id
            email
            name
            status
            expiresAt
            createdAt
            updatedAt
          }
        }
      }
        `,
        variables: {
          requestId: requestId,
        },
      }),
    });

    const { data, errors } = await response.json();
    const res = data.checkSignUpRequest;
    if (!res.success) {
      throw new Error(res.message);
    }

    return NextResponse.json({
      success: res.success || false,
      message: res.message || "가입 요청 조회 성공",
      payload: res.signUpRequest,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || "조회 중 오류가 발생했습니다.",
    });
  }
}
