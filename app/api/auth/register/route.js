import { NextResponse } from "next/server";
import { mockUsers } from "@/mock/users";
import { validInviteCodes } from "@/mock/inviteCodes";

export async function POST(req) {
  const body = await req.json();
  const { first_name, last_name, email, password, invite_code, type } = body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !password ||
    !invite_code ||
    !type
  ) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  if (!validInviteCodes.includes(invite_code)) {
    return NextResponse.json(
      { message: "Invalid invite code" },
      { status: 400 }
    );
  }

  const userExists = mockUsers.find((u) => u.email === email);
  if (userExists) {
    return NextResponse.json(
      { message: "Email already exists" },
      { status: 409 }
    );
  }

  mockUsers.push({
    id: `user_${mockUsers.length + 1}`,
    first_name,
    last_name,
    email,
    password,
    type,
    verified: false,
  });

  return NextResponse.json({
    status: "otp_sent",
    message: `OTP sent to ${email}`,
  });
}
