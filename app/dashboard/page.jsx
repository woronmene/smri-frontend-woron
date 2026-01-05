"use client";

import { useState, useContext } from "react";
import { useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import { deleteCourse, getAllCourses } from "@/lib/cms-api";
import { useRouter } from "next/navigation";
import CourseCard from "@/components/dashboard/CourseCard";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, GraduationCap, AlertCircle, CheckCircle } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import { getStudentCourseProgress } from "@/lib/analytics-api";

// We move fetchCourses inside the component or pass user role to it

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const [filter, setFilter] = useState("all");
  
  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => setShowConfirmModal(false),
    confirmText: "Confirm",
    cancelText: "Cancel",
    isDestructive: false,
    singleButton: false, // For simple alerts
  });
  // Check user role
  // Verify role from user object or email pattern for demo
  const isTeacher =
    user?.role === "teacher" || user?.email?.includes("teacher");
  const isAdmin = 
    user?.role === "admin" || 
    user?.role === "smri_admin" || 
    user?.role === "school_admin" || 
    user?.email?.includes("admin");

  const isSmriAdmin = user?.role === "smri_admin";

  // Determine role string for API
  const userRole = isAdmin ? "admin" : isTeacher ? "teacher" : "student";

  const {
    data: courses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses", userRole], // Include role in key to refetch if it changes
    queryFn: () => getAllCourses(userRole),
  });

  const userId = user?.user_id || user?.id || user?.userId || null;
  const isStudent = !isAdmin && !isTeacher;

  const progressQueries = useQueries({
    queries:
      courses && isStudent && userId
        ? courses.map((course) => ({
            queryKey: ["student-course-progress", userId, course.id],
            queryFn: () => getStudentCourseProgress(userId, course.id),
            enabled: true,
          }))
        : [],
  });

  const progressByCourseId =
    courses && isStudent
      ? courses.reduce((acc, course, index) => {
          const result = progressQueries[index];
          const totalLessons =
            course.modules?.reduce(
              (sum, m) => sum + ((m.lessons || []).length || 0),
              0
            ) || 0;
          const completedCount = result?.data?.completed_count || 0;
          const percent =
            totalLessons > 0
              ? Math.round((completedCount / totalLessons) * 100)
              : 0;
          acc[course.id] = percent;
          return acc;
        }, {})
      : {};

  const filteredCourses = courses?.filter((course) => {
    const status = (course.status || "").toLowerCase();
    const audience = (course.audience || "Student");

    // 1. Audience Check
    // Students should NOT see Teacher courses
    if (!isAdmin && !isTeacher) {
       if (audience === "Teacher") return false;
    }

    // Teachers should see Teacher courses. 
    // If requirement implies Teachers ONLY see Teacher courses in their view, we might need strictness.
    // But usually Teachers need to see Student courses too.
    // User said: "I selected 'teacher'... I was expecting it to be scoped to only show teachers."
    // And "I logged out and logged in as a student... I could see it... I'm only supposed to be able to see it as a teacher".
    // This confirms shielding the course FROM Students.

    if (filter === "all") return true;

    // Admin specific filters
    if (isAdmin) {
      if (filter === "draft") return status === "draft";
      if (filter === "published") return status === "published";
    }

    // Student specific filters
    if (!isAdmin && !isTeacher) {
      if (filter === "in-progress") {
        return (
          status === "in-progress" ||
          (status === "published" &&
            (progressByCourseId[course.id] || course.progress || 0) > 0 &&
            (progressByCourseId[course.id] || course.progress || 0) < 100)
        );
      }
      if (filter === "completed") {
        return (
          status === "completed" ||
          (status === "published" &&
            (progressByCourseId[course.id] || course.progress || 0) === 100)
        );
      }
    }

    // Fallback for generic filters
    return Boolean(status === filter);
  });

  const handleDeleteCourse = (courseId) => {
    setConfirmConfig({
      title: "Delete Course?",
      message: "Are you sure you want to delete this course? This action cannot be undone.",
      confirmText: "Yes, Delete",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteCourse(courseId);
          queryClient.invalidateQueries({ queryKey: ["courses"] });
          setShowConfirmModal(false);
        } catch (error) {
          console.error("Failed to delete course:", error);
          // Show error alert modal
          setShowConfirmModal(false); // Close delete confirm
          setTimeout(() => {
             setConfirmConfig({
                title: "Deletion Failed",
                message: "Failed to delete course. Please try again.",
                confirmText: "Okay",
                singleButton: true,
                isDestructive: true,
                onConfirm: () => setShowConfirmModal(false),
             });
             setShowConfirmModal(true);
          }, 300);
        }
      },
      onCancel: () => setShowConfirmModal(false),
    });
    setShowConfirmModal(true);
  };

  const handleEditCourse = (courseId) => {
    router.push(`/dashboard/courses/create?courseId=${courseId}`);
  };

  let tabs = [{ id: "all", label: "All Courses" }];

  if (isAdmin) {
    // Admin Tabs
    tabs = [
      { id: "all", label: "All Courses" },
      { id: "draft", label: "Drafts" },
      { id: "published", label: "Published" },
    ];
  } else if (isTeacher) {
    // Teacher Tabs
    tabs = [{ id: "all", label: "All Courses" }];
  } else {
    // Student Tabs (Default)
    tabs = [
      { id: "all", label: "All Courses" },
      { id: "in-progress", label: "In Progress" },
      { id: "completed", label: "Completed" },
    ];
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header - matches design screenshot */}
      <div className="flex flex-col gap-4 sm:gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Learning Overview
          </h1>
          <div className="inline-flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600 bg-white px-3 py-2 sm:py-3 rounded-full border border-gray-200 shadow-sm">
            <GraduationCap size={16} />
            <span className="font-medium">
              Active Courses ({filteredCourses?.length || 0})
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Tabs - Segmented Control Style */}
         {isSmriAdmin && <div className="inline-flex w-full sm:w-auto p-1 bg-gray-100 rounded-lg border border-gray-200 overflow-x-auto max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === tab.id
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>}

          {/* Create Course Button - Only visible for admins */}
          {isSmriAdmin && (
            <Button
              onClick={() => router.push("/dashboard/courses/create")}
              className="bg-[#3AD0E3] hover:bg-cyan-400 cursor-pointer text-black flex items-center justify-center gap-2 rounded-[999px] px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm shadow-cyan-500/20 w-full sm:w-auto"
            >
              <Plus size={18} />
              <span className="whitespace-nowrap">Create Course</span>
            </Button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-56 sm:h-64">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-cyan-500" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-xl border border-red-100">
          <p className="text-red-500">
            Error loading courses. Please try again.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredCourses?.map((course) => {
              const isStudent = !isAdmin && !isTeacher;
              const effectiveProgress = isStudent
                ? progressByCourseId[course.id] ?? course.progress ?? 0
                : course.progress ?? 0;
              return (
                <CourseCard
                  key={course.id}
                  course={{ ...course, progress: effectiveProgress }}
                  isAdmin={isAdmin}
                  isStudent={isStudent}
                  onDelete={isSmriAdmin ? handleDeleteCourse : undefined}
                  onEdit={isSmriAdmin ? handleEditCourse : undefined}
                />
              );
            })}
          </div>

          {/* Empty State */}
          {filteredCourses?.length === 0 && (
            <div className="mt-4 sm:mt-6 text-center py-12 sm:py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              
              {filter === 'draft' ? (
                 <>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        No draft courses
                    </h3>
                    <p className="text-gray-500 mb-6 text-sm sm:text-base">
                        There are no courses here
                    </p>
                 </>
              ) : filter === 'published' ? (
                 <>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        No published courses
                    </h3>
                    <p className="text-gray-500 mb-6 text-sm sm:text-base">
                        There are no courses here
                    </p>
                 </>
              ) : (
                 <>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        No courses yet
                    </h3>
                    <p className="text-gray-500 mb-6 text-sm sm:text-base">
                        {isAdmin
                        ? "Get started by creating your first course"
                        : "No courses found in this category"}
                    </p>
                    {isSmriAdmin && (
                        <Button
                        onClick={() => router.push("/dashboard/courses/create")}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                        >
                        <Plus size={18} className="mr-2" />
                        Create Your First Course
                        </Button>
                    )}
                 </>
              )}
            </div>
          )}
        </>
      )}


      {showConfirmModal && (
        <ConfirmationModal
          title={confirmConfig.title}
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onCancel={confirmConfig.onCancel}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          isDestructive={confirmConfig.isDestructive}
          singleButton={confirmConfig.singleButton}
          type={confirmConfig.type}
        />
      )}
    </div>
  );
}

function ConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  singleButton = false,
  type = "default", // 'default' | 'success'
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              type === "success"
                ? "bg-green-100 text-green-600"
                : isDestructive
                ? "bg-red-100 text-red-600"
                : "bg-cyan-100 text-cyan-600"
            }`}
          >
            {type === "success" ? (
              <CheckCircle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {message}
          </p>
          <div className="flex gap-3 w-full">
            {!singleButton && (
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1 rounded-xl py-3 border-gray-200"
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={onConfirm}
              className={`flex-1 rounded-xl py-3 text-white ${
                type === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : isDestructive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-cyan-600 hover:bg-cyan-700"
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
