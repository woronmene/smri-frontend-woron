import { NextResponse } from "next/server";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

export async function POST(req) {
  const body = await req.json();
  const { first_name, last_name, email, password, invite_code, type } = body;

  if (!first_name || !last_name || !email || !type) {
    return NextResponse.json(
      { message: "All required fields are missing" },
      { status: 400 },
    );
  }

  const accountType = String(type || "").toLowerCase();

  try {
    // Organization → create a school (SMRI admin only; no password – they get a reset email)
    if (accountType === "organization") {
      const authHeader = req.headers.get("authorization");
      const headers = { "Content-Type": "application/json" };
      if (authHeader) headers["Authorization"] = authHeader;

      const schoolRes = await fetch(`${USER_SERVICE_URL}/schools`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: `${first_name} ${last_name}`.trim(),
          email,
          student_size: null,
        }),
      });

      const schoolData = await schoolRes.json().catch(() => ({}));

      if (!schoolRes.ok) {
        return NextResponse.json(
          {
            message:
              schoolData.detail ||
              schoolData.message ||
              "Failed to register organization",
          },
          { status: schoolRes.status },
        );
      }

      return NextResponse.json({
        status: "created",
        message: "Organization created. Password reset email sent.",
        school: schoolData,
        type: "organization",
      });
    }

    // Students/teachers → create a user
    if (!password) {
      return NextResponse.json(
        { message: "Password is required for students and teachers" },
        { status: 400 },
      );
    }
    if (!invite_code) {
      return NextResponse.json(
        { message: "Invite code is required for students and teachers" },
        { status: 400 },
      );
    }

    const role = accountType; // "student" or "teacher"

    const userRes = await fetch(`${USER_SERVICE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        first_name,
        last_name,
        middle_name: null,
        role,
        invite_code,
      }),
    });

    const userData = await userRes.json().catch(() => ({}));

    if (!userRes.ok) {
      return NextResponse.json(
        {
          message:
            userData.detail || userData.message || "Failed to register user",
        },
        { status: userRes.status },
      );
    }

    // Backend sends OTP via "notification" (logged locally). Frontend just needs to move to verify page.
    return NextResponse.json({
      status: "otp_sent",
      message: `OTP sent to ${email}`,
      user: userData,
      type: accountType,
    });
  } catch (err) {
    console.error("Error calling user service /users:", err);
    return NextResponse.json(
      { message: "Unable to reach user service" },
      { status: 502 },
    );
  }
}
