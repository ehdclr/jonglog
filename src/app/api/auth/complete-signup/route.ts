import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_ENDPOINT =  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql";

export async function POST(
  request: NextRequest,
) {

  const { name, password, bio, avatarUrl, signupRequestId } = await request.json();

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        mutation CreateUser($createUserInput: CreateUserInput!, $signupRequestId: String!) {
          createUser(createUserInput: $createUserInput, signupRequestId: $signupRequestId) {
            success
            message
          }
        }
      `,
        variables: {
          createUserInput: {
            name,
            password,
            bio,
            avatar_url: avatarUrl || "",
            role: "admin",
          },
          signupRequestId,
        },
      }),
    });

    console.log('response', response);

    const { data, errors } = await response.json();
    const res = data.createUser;
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
