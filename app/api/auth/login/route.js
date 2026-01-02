import { NextResponse } from "next/server";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

export async function POST(req) {
  const { email, password, type } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 }
    );
  }

  const accountType = String(type || "").toLowerCase();
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  try {
    // ---------------------------------------------------------
    // 1. Organization (School) Login
    // ---------------------------------------------------------
    if (accountType === "organization") {
      const schoolRes = await fetch(`${USER_SERVICE_URL}/auth/schools/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const schoolData = await schoolRes.json().catch(() => ({}));

      if (schoolRes.ok) {
        const accessToken = schoolData.access_token;
        const school = schoolData.school || {};

        const normalizedUser = {
          id: school.school_id,
          school_id: school.school_id,
          email: school.email,
          fullName: school.name,
          role: "school_admin", // Explicit role for frontend
          type: "organization",
        };

        return NextResponse.json({
          status: "success",
          token: accessToken,
          user: normalizedUser,
          accountType: "organization",
        });
      }

      // Return error from school login attempt
      return NextResponse.json(
        {
          message:
            schoolData.detail || schoolData.message || "Failed to login as organization",
        },
        { status: schoolRes.status }
      );
    }

    // ---------------------------------------------------------
    // 2. Individual (User) Login
    // ---------------------------------------------------------
    const userRes = await fetch(`${USER_SERVICE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const userData = await userRes.json().catch(() => ({}));

    if (userRes.ok) {
      const accessToken = userData.access_token;
      const rawUser = userData.user || {};

      const fullName =
        rawUser.fullName ||
        `${rawUser.first_name || ""} ${rawUser.last_name || ""}`.trim();

      const normalizedUser = {
        ...rawUser,
        fullName,
        type: rawUser.type || rawUser.role || "user",
      };

      return NextResponse.json({
        status: "success",
        token: accessToken,
        user: normalizedUser,
        accountType: "user",
      });
    }

    // If explicit "user" type was requested, fail here.
    // If no type was provided (legacy), we COULD fallback, but cleaner to fail.
    // Given the UI now enforces a selection, we can stick to strict routing.
    return NextResponse.json(
      { message: userData.detail || userData.message || "Failed to login" },
      { status: userRes.status }
    );
  } catch (err) {
    console.error("Error calling user service login:", err);
    return NextResponse.json(
      { message: "Unable to reach user service" },
      { status: 502 }
    );
  }
}
