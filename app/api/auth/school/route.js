import { NextResponse } from "next/server";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://0qdrpi2zhe.execute-api.us-east-1.amazonaws.com";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${USER_SERVICE_URL}/schools`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          message:
            data.detail ||
            data.message ||
            "Could not load organization settings",
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error calling user service /schools:", err);
    return NextResponse.json(
      { message: "Unable to reach user service" },
      { status: 502 }
    );
  }
}


