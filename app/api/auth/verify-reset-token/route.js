import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (token !== "mock-reset-token") {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 400 }
    );
  }

  return NextResponse.json({ valid: true });
}
