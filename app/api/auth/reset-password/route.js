import { NextResponse } from "next/server";
import { mockUsers } from "@/mock/users";


export async function POST(req) {
  const { token, new_password } = await req.json();

  if (token !== "mock-reset-token") {
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }

  // mock update: update first user
  if (mockUsers.length > 0) {
    mockUsers[0].password = new_password;
  }

  return NextResponse.json({
    message: "Password reset successfully",
  });
}
