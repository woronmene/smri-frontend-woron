import { NextResponse } from 'next/server';
import { getAllCourses } from '@/lib/cms-api';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Optional: allow role to be passed via header for server-side calls
    const userRole = request.headers.get('x-user-role');
    const courses = await getAllCourses(userRole);
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Failed to fetch courses from CMS:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
