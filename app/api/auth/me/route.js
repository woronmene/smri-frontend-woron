import { NextResponse } from "next/server";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000"
    : "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com");

export async function GET(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${USER_SERVICE_URL}/users`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(`[API] User service returned ${res.status}:`, data);
      return NextResponse.json(
        { message: data.detail || data.message || "Could not load profile" },
        { status: res.status }
      );
    }

    const rawUser = data || {};
    // ... rest of logic
    const fullName =
      rawUser.fullName ||
      `${rawUser.first_name || ""} ${rawUser.last_name || ""}`.trim();

    const normalizedUser = {
      ...rawUser,
      fullName,
      type: rawUser.type || rawUser.role || null,
    };

    return NextResponse.json(normalizedUser);
  } catch (err) {
    console.error("Error calling user service /users:", err);
    return NextResponse.json(
      { message: "Unable to reach user service" },
      { status: 502 }
    );
  }
}
