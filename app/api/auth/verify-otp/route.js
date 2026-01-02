import { NextResponse } from "next/server";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

export async function POST(req) {
  const { email, otp, type } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { message: "Email and OTP are required" },
      { status: 400 }
    );
  }

  const accountType = String(type || "").toLowerCase();

  try {
    // Organization → verify school OTP
    if (accountType === "organization") {
      const res = await fetch(`${USER_SERVICE_URL}/schools/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return NextResponse.json(
          {
            message:
              data.detail ||
              data.message ||
              "Failed to verify organization OTP",
          },
          { status: res.status }
        );
      }

      return NextResponse.json({
        status: "success",
        message: "Account verified successfully",
        school: data.school || data,
        type: "organization",
      });
    }

    // Students/teachers → verify user OTP
    const res = await fetch(`${USER_SERVICE_URL}/users/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || "Failed to verify OTP" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Account verified successfully",
      user: data.user || data,
      type: accountType || "user",
    });
  } catch (err) {
    console.error("Error calling user service verify-otp:", err);
    return NextResponse.json(
      { message: "Unable to reach user service" },
      { status: 502 }
    );
  }
}
