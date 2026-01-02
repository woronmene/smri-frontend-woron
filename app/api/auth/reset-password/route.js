
import { NextResponse } from "next/server";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

export async function POST(req) {
  try {
    const { email, token, new_password, type } = await req.json();

    if (!email || !token || !new_password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const isOrg = type === "organization";
    const endpoint = isOrg
      ? `${USER_SERVICE_URL}/auth/schools/password-update`
      : `${USER_SERVICE_URL}/auth/password-update`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        token,
        new_password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || "Could not update password" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
