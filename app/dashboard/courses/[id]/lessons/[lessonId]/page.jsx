'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, Play, FileText, Clock } from 'lucide-react';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import LessonContentRenderer from '@/components/dashboard/LessonContentRenderer';

const fetchCourse = async (id) => {
  const res = await fetch(`/api/courses/${id}`);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, lessonId } = params;
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');
  const isTeacher = user?.role === 'teacher' || user?.email?.includes('teacher');

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourse(courseId),
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading lesson.</p>
        <button 
          onClick={() => router.push(`/dashboard/courses/${courseId}`)}
          className="mt-4 text-cyan-600 hover:underline"
        >
          Back to Course
        </button>
      </div>
    );
  }

  // Find current lesson and navigation logic
  let currentLesson = null;
  let prevLesson = null;
  let nextLesson = null;
  let currentModule = null;
  
  // Need to traverse modules to identify context
  let lessonIndex = 0;
  let totalLessons = 0;
  
  // Flattening for easy nav, but keeping module info might be useful
  const allLessons = [];
  course.modules.forEach((mod, mIdx) => {
      mod.lessons.forEach((les, lIdx) => {
          allLessons.push({
              ...les,
              moduleTitle: mod.title,
              moduleIndex: mIdx + 1,
              lessonIndex: lIdx + 1
          });
      });
  });

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  
  if (currentIndex !== -1) {
    currentLesson = allLessons[currentIndex];
    prevLesson = allLessons[currentIndex - 1];
    nextLesson = allLessons[currentIndex + 1];
  }

  if (!currentLesson) {
    return <div className="p-8">Lesson not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-8 text-sm text-gray-500 mb-8 pt-4">
        <Link href="/dashboard" className="hover:text-gray-900 transition-colors">My Courses</Link>
        {/* <span>/</span> */}
        <Link href={`/dashboard/courses/${courseId}`} className="hover:text-gray-900 transition-colors">{course.title}</Link>
        {/* <span>/</span> */}
        <span className="text-gray-900 font-medium">Modules</span>
      </nav>

      {/* Header Info */}
      <div className="mb-8">
        <div className="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-3 flex items-center gap-2">
            <span>{course.title}</span>
            <span>•</span>
            <span>Module {currentLesson.moduleIndex}</span>
            <span>•</span>
            <span>Lesson {currentLesson.lessonIndex}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={12} /> 5 min read / watch</span>
        </div>
        
        <h1 className="text-[24px] md:text-[32px] font-bold text-gray-900 mb-4 tracking-tight leading-tight">
          {currentLesson.title}
        </h1>
        
        <p className="text-[14px] text-[#737373] max-w-3xl leading-relaxed">
          {currentLesson.introduction || "Get an overview of key concepts, history, and real-world applications related to this topic."}
        </p>
      </div>

      {/* Main Content (Renderer Handles Video/Text) */}
      <div className="mb-12">
         {/* If we had a dedicated video URL field, we might render a featured player here. 
             Assuming the renderer handles it or we manually inject for demo if content is empty/structured. 
             For now, relying on content renderer but wrapping it cleanly. 
         */}
         <article className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-img:rounded-2xl prose-img:shadow-sm">
            <LessonContentRenderer content={currentLesson.content || ''} />
         </article>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t border-gray-100">
        
        {/* Previous Button */}
        <div>
           {prevLesson ? (
            <Link
              href={`/dashboard/courses/${courseId}/lessons/${prevLesson.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-900 transition-all bg-white"
            >
              <ChevronLeft size={16} />
              Previous
            </Link>
          ) : (
            <div className="w-[100px]"></div> // Spacer
          )}
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-3">
          {/* Mark as Done */}
          {!isAdmin && !isTeacher && (
            <button className="flex items-center gap-2 bg-[#4ADE80] hover:bg-green-500 text-black px-6 py-3 rounded-full text-sm font-medium cursor-pointer transition-colors">
               <span>Mark as done</span>
            </button>
          )}

          {/* Next Button */}
          {nextLesson ? (
             <Link
               href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
               className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-900 transition-all bg-white"
             >
               Next
               <ChevronRight size={16} />
             </Link>
          ) : (
             <div className="w-[88px]"></div> // approximate spacer for alignment if needed
          )}
        </div>

      </div>
    </div>
  );
}
