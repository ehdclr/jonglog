import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql";

export async function POST(
  request: NextRequest,
  { params }: { params: { reqeustId: string } }
) {
  const { reqeustId } = params;
  const refreshToken = request.cookies.get("refreshToken")?.value;
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
        mutation ProcessSignUpRequest($requestId: String!, $status: String!) {
          processSignUpRequest(requestId: $requestId, status: $status) {
            success
            message
          }
        }
      `,
        variables: {
          requestId: reqeustId,
          status: "rejected",
        },
      }),
    });

    const { data, errors } = await response.json();
    const res = data.processSignUpRequest;
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
