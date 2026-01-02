import { NextResponse } from 'next/server';
import { getCourseById } from '@/lib/cms-api';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const course = await getCourseById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course from CMS:', error);
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }
}
