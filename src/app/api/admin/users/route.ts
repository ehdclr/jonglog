import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql";

export async function POST(request: NextRequest) {
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
        query getAllUsers {
          getAllUsers {
            users {
              id
              name
              email
              role
              avatar_url
              bio
            }
            success
            message
          }
        }
        `,
      }),
    });

    const { data, errors } = await response.json();
    const res = data.getAllUsers;
    if (!res.success) {
      throw new Error(res.message);
    }
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("GraphQL 요청 오류:", error);
    return NextResponse.json(
      { error: error.message || "GraphQL 요청 오류" },
      { status: 500 }
    );
  }
}
