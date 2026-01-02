
import { NextResponse } from "next/server";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

export async function POST(req) {
  try {
    const { email, type } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const isOrg = type === "organization";
    const endpoint = isOrg
      ? `${USER_SERVICE_URL}/auth/schools/password-reset`
      : `${USER_SERVICE_URL}/auth/password-reset`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        // We often still want to return 200 to prevent email enumeration, 
        // but if the backend explicitly threw 500, we might bubble it up or mask it.
        // In the user-service code, it returns 200 even if user not found (to prevent enumeration).
        // If it returns 500, it's a real error.
        if (res.status >= 500) {
             return NextResponse.json(
                { message: "Could not process request" },
                { status: 502 }
             );
        }
    }

    // Always return 200 success message to frontend
    return NextResponse.json({
        message: "If an account exists, a reset link has been sent."
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
