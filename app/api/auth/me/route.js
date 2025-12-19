import { NextResponse } from "next/server";
import { mockUsers } from "@/mock/users";

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader ? authHeader.split(' ')[1] : null;

  // For mock demo, try to find user by token (email), otherwise default to admin 
  // ONLY if strictly needed, but better to return 401 if no token for strictness. 
  // However, for pre-existing behavior compat:
  let user;
  
  if (token) {
    user = mockUsers.find(u => u.email === token);
  }
  
  // Fallback or unauthorized handling
  if (!user) {
    // If no token provided, maybe we default to admin for ease of dev? 
    // Or strictly require login. Let's strictly require login to test the flow properly.
    // user = mockUsers.find(u => u.email === 'admin@smri.com');
    // Actually, let's keep the fallback for now to avoid breaking if the user is not logged in yet 
    // but the app expects something. But ideally, 401 is better.
    // Let's return 401 if not found.
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }
  
  return NextResponse.json(user);
}
