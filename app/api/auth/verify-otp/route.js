import { NextResponse } from "next/server";
import { mockUsers } from "@/mock/users";

const CORRECT_OTP = "11111";

export async function POST(req) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { message: "Email and OTP are required" },
      { status: 400 }
    );
  }

  if (otp !== CORRECT_OTP) {
    return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
  }

  const user = mockUsers.find((u) => u.email === email);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  user.verified = true;

  return NextResponse.json({
    status: "success",
    message: "Account verified successfully",
    user,
  });
}
