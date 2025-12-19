import { NextResponse } from 'next/server';
import { getCourseById } from '@/lib/firebase-db';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const course = await getCourseById(id);
    // getCourseById throws if not found? Or returns null?
    // Looking at firebase-db implementation (not shown recently, assuming standard behavior)
    // Actually, getDoc returns undefined if not exists?
    // Let's assume it returns data or we catch error.
    
    // If getCourseById is implemented to return null/undefined if missing:
    if (!course) {
       return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    // If error is specifically "not found"
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }
}
