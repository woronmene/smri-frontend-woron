"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Play,
  FileText,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import LessonContentRenderer from "@/components/dashboard/LessonContentRenderer";
import { getCourseById } from "@/lib/cms-api";
import {
  markLessonComplete,
  getStudentCourseProgress,
} from "@/lib/analytics-api";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { id: courseId, lessonId } = params;
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const isAdmin =
    user?.role === "admin" || user?.role === "smri_admin" || user?.email?.toLowerCase().includes("admin");
  const isTeacher =
    user?.role === "teacher" || user?.role === "school_admin" || user?.email?.toLowerCase().includes("teacher");

  const userId = user?.user_id || user?.id || user?.userId || null;
  const schoolId = user?.school_id || null;

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  });

  const totalLessons =
    course?.modules?.reduce(
      (sum, m) => sum + ((m.lessons || []).length || 0),
      0
    ) || 0;

  const {
    data: studentProgress,
  } = useQuery({
    queryKey: ["student-course-progress", userId, courseId],
    queryFn: () => getStudentCourseProgress(userId, courseId),
    enabled: !!courseId && !!userId && !isAdmin && !isTeacher && totalLessons > 0,
  });

  const completedCount = studentProgress?.completed_count || 0;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

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

  // LMS Logic: Find current lesson and navigation context
  let currentLesson = null;
  let prevLesson = null;
  let nextLesson = null;

  const allLessons = [];
  if (course.modules) {
      course.modules.forEach((mod, mIdx) => {
        (mod.lessons || []).forEach((les, lIdx) => {
            allLessons.push({
                ...les,
                moduleId: mod.id,
                moduleTitle: mod.title,
                moduleIndex: mIdx + 1,
                lessonIndex: lIdx + 1
            });
        });
      });
  }

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

  if (currentIndex !== -1) {
    currentLesson = allLessons[currentIndex];
    prevLesson = allLessons[currentIndex - 1];
    nextLesson = allLessons[currentIndex + 1];
  }

  if (!currentLesson) {
    return <div className="p-8">Lesson not found</div>;
  }

  const handleMarkAsDone = async () => {
    try {
      await markLessonComplete({
        userId: userId || "mock-student",
        schoolId,
        courseId,
        moduleId: currentLesson.moduleId, 
        lessonId,
      });
      queryClient.invalidateQueries({
        queryKey: ["student-course-progress", userId, courseId],
      });
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pb-20 font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-8 text-sm text-gray-500 mb-8 pt-4">
        <Link
          href="/dashboard"
          className="hover:text-gray-900 transition-colors"
        >
          My Courses
        </Link>
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="hover:text-gray-900 transition-colors"
        >
          {course.title}
        </Link>
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
          <span className="flex items-center gap-1">
            <Clock size={12} /> 5 min read / watch
          </span>
        </div>

        {!isAdmin && !isTeacher && (
          <div className="mt-2 flex items-center gap-3">
            <div className="w-40 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {progressPercent}% complete
            </span>
          </div>
        )}

        <h1 className="text-[24px] md:text-[32px] font-bold text-gray-900 mb-4 tracking-tight leading-tight">
          {currentLesson.title}
        </h1>

        <p className="text-[14px] text-[#737373] max-w-3xl leading-relaxed">
          {currentLesson.introduction ||
            "Get an overview of key concepts, history, and real-world applications related to this topic."}
        </p>
      </div>

      {/* Main Content */}
      <div className="mb-12">
        <article className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-img:rounded-2xl prose-img:shadow-sm">
          <LessonContentRenderer content={currentLesson.content || ""} />
        </article>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t border-gray-100">
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
            <div className="w-[100px]"></div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isAdmin && !isTeacher && (
            <button
              onClick={handleMarkAsDone}
              className="flex items-center gap-2 bg-[#4ADE80] hover:bg-green-500 text-black px-6 py-3 rounded-full text-sm font-medium cursor-pointer transition-colors"
            >
              <span>Mark as done</span>
            </button>
          )}

          {nextLesson ? (
            <Link
              href={`/dashboard/courses/${courseId}/lessons/${nextLesson.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-900 transition-all bg-white"
            >
              Next
              <ChevronRight size={16} />
            </Link>
          ) : (
            <div className="w-[88px]"></div> 
          )}
        </div>
      </div>
    </div>
  );
}
