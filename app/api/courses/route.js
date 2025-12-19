import { NextResponse } from 'next/server';
import { getAllCourses } from '@/lib/firebase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const courses = await getAllCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
