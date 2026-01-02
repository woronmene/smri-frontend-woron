"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { AuthContext } from "@/context/AuthContext";
import { getAllCourses } from "@/lib/cms-api";
import { Button } from "@/components/ui/button";

// TODO: replace with real analytics API data once backend is wired
const MOCK_STUDENTS = [
  {
    id: "s1",
    name: "Faith Johnson",
    email: "faith@example.com",
    progress: 89,
    lastActive: "2h ago",
  },
  {
    id: "s2",
    name: "Daniel Davis",
    email: "daniel@example.com",
    progress: 100,
    lastActive: "1d ago",
  },
  {
    id: "s3",
    name: "Johnny Jackson",
    email: "johnny@example.com",
    progress: 45,
    lastActive: "3h ago",
  },
  {
    id: "s4",
    name: "Sam Eddie",
    email: "sam@example.com",
    progress: 15,
    lastActive: "1w ago",
  },
  {
    id: "s5",
    name: "Jane Cooper",
    email: "jane@example.com",
    progress: 100,
    lastActive: "2d ago",
  },
  {
    id: "s6",
    name: "Sarah Witz",
    email: "sarah@example.com",
    progress: 67,
    lastActive: "4h ago",
  },
  {
    id: "s7",
    name: "Emmanuel Wilson",
    email: "emmanuel@example.com",
    progress: 52,
    lastActive: "6h ago",
  },
  {
    id: "s8",
    name: "Lydia Sanderson",
    email: "lydia@example.com",
    progress: 75,
    lastActive: "2d ago",
  },
  {
    id: "s9",
    name: "Jacob Jones",
    email: "jacob@example.com",
    progress: 60,
    lastActive: "3h ago",
  },
  {
    id: "s10",
    name: "David Smith",
    email: "david@example.com",
    progress: 90,
    lastActive: "6h ago",
  },
];

const PAGE_SIZE = 5;

const TeacherAnalytics = () => {
  const { user } = useContext(AuthContext);

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [page, setPage] = useState(1);

  const isTeacher =
    user?.role === "teacher" || user?.email?.toLowerCase().includes("teacher");
  const isAdmin =
    user?.role === "admin" || user?.email?.toLowerCase().includes("admin");

  const userRole = isAdmin ? "admin" : isTeacher ? "teacher" : "student";

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["analytics-courses", userRole],
    queryFn: () => getAllCourses(userRole),
  });

  useEffect(() => {
    if (!courses || courses.length === 0) return;
    if (!selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses?.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const students = MOCK_STUDENTS;

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return students.slice(start, start + PAGE_SIZE);
  }, [students, currentPage]);

  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  if (coursesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <GraduationCap className="w-7 h-7 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-red-100">
        <p className="text-red-500">
          Error loading courses. Please try again.
        </p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-700 font-medium">
          No courses found. Create a course to view analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Course Selector */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Course Analytics</h2>
          <p className="text-gray-500 text-sm">
            View student progress across your courses.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="inline-flex w-full sm:w-auto p-1 bg-gray-100 rounded-lg border border-gray-200 overflow-x-auto max-w-full">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleCourseSelect(course.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                  selectedCourseId === course.id
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {course.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Course Summary */}
      {selectedCourse && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedCourse.title}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {selectedCourse.description || "No short description provided."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium">
              <Users size={14} />
              <span>{students.length} Students</span>
            </div>
          </div>
        </div>
      )}

      {/* Students Progress Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Student Progress
          </h3>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4 font-medium">Student</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Progress</th>
                <th className="py-2 pr-4 font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="py-2 pr-4 text-gray-500">
                    {student.email}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            student.progress === 100
                              ? "bg-emerald-500"
                              : "bg-cyan-500"
                          }`}
                          style={{
                            width: `${Math.max(student.progress, 5)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {student.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-gray-500">
                    {student.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="h-8 w-8 rounded-full"
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="text-xs text-gray-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, students.length)} of{" "}
            {students.length}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="h-8 w-8 rounded-full"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalytics;
