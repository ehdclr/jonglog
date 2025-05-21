import { NextRequest, NextResponse } from "next/server";

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
            getCurrentUser {
              success
              message
              user {
                    id
                    email
                    name
                    role
                    avatarUrl
              }
            }
          }
        `,
      }),
    });
    const { data, errors } = await response.json();
    console.log("data", data);
    const res = data.getCurrentUser;
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
