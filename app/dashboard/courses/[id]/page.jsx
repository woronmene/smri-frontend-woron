'use client';

import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import ModuleAccordion from '@/components/dashboard/ModuleAccordion';
import { AuthContext } from '@/context/AuthContext';
import { getCourseById } from '@/lib/cms-api';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === 'admin' || user?.role === 'smri_admin' || user?.email?.includes('admin');
  const isTeacher = user?.role === 'teacher' || user?.role === 'school_admin' || user?.email?.includes('teacher');

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading course details.</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Courses</span>
      </button>

      <div className="mb-8 ">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
        <p className="text-gray-600 text-lg">{course.description}</p>
        
        {!isAdmin && !isTeacher && (
          <div className="mt-6 flex items-center gap-4">
             <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-xs ">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress || 0}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">{course.progress || 0}% Complete</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Content</h2> */}
        {course.modules.map((module) => (
          <ModuleAccordion key={module.id} module={module} courseId={course.id} />
        ))}
      </div>
    </div>
  );
}
