import { NextResponse } from "next/server";
import { mockUsers } from "@/mock/users";

export async function POST(req) {
  const { email, password } = await req.json();

  const user = mockUsers.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return NextResponse.json(
      { message: "Incorrect email or password" },
      { status: 401 }
    );
  }

  if (!user.verified) {
    return NextResponse.json(
      { message: "Account not verified" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    status: "success",
    token: user.email, // Simple token for mock strategy
    user,
  });
}
