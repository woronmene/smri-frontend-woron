import { NextResponse } from "next/server";

const USER_SERVICE_URL = "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

export async function POST(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${USER_SERVICE_URL}/auth/password-change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          message: data.detail || data.message || "Could not change password",
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error calling user service /auth/change-password:", err);
    return NextResponse.json(
      { message: "Unable to reach user service" },
      { status: 502 }
    );
  }
}
