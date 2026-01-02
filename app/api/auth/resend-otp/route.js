import { NextResponse } from "next/server";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

export async function POST(req) {
  const { email, type } = await req.json();

  if (!email) {
    return NextResponse.json(
      { message: "Email is required" },
      { status: 400 }
    );
  }

  const accountType = String(type || "").toLowerCase();

  try {
    // Organization → resend school OTP
    if (accountType === "organization") {
      const res = await fetch(`${USER_SERVICE_URL}/schools/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return NextResponse.json(
          {
            message:
              data.detail ||
              data.message ||
              "Failed to resend organization OTP",
          },
          { status: res.status }
        );
      }

      return NextResponse.json({
        status: "success",
        message: "OTP resent successfully",
      });
    }

    // Students/teachers → resend user OTP
    const res = await fetch(`${USER_SERVICE_URL}/users/resend-otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        return NextResponse.json(
            { message: data.detail || data.message || "Failed to resend OTP" },
            { status: res.status }
        );
    }

    return NextResponse.json({
        status: "success",
        message: "OTP resent successfully",
    });

  } catch (err) {
    console.error("Error calling user service resend-otp:", err);
    return NextResponse.json(
      { message: "Unable to reach user service" },
      { status: 502 }
    );
  }
}
