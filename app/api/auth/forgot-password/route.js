import { NextResponse } from "next/server";

export async function POST(req) {
  const { email } = await req.json();

  return NextResponse.json({
    message: "Reset link sent to your email",
    reset_url: `https://app.com/reset-password?token=mock-reset-token`,
  });
}
