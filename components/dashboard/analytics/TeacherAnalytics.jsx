"use client";

import { useContext, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Users,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  UserCheck,
  BookOpen,
  BookMarked,
} from "lucide-react";

import { AuthContext } from "@/context/AuthContext";
import { getAllCourses } from "@/lib/cms-api";
import { getSchoolStudents } from "@/lib/user-api";
import { getSchoolCourseStudentsProgress } from "@/lib/analytics-api";
import { formatRelativeTime, isActiveWithinPastDays } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const TeacherAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [page, setPage] = useState(1);
  const targetSchoolId = user?.school_id ?? null;

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["analytics-courses", "teacher"],
    queryFn: () => getAllCourses("teacher"),
  });

  const { data: studentsData } = useQuery({
    queryKey: ["analytics-school-students", targetSchoolId],
    queryFn: () => getSchoolStudents(targetSchoolId),
    enabled: !!targetSchoolId,
  });

  const courseIds = useMemo(() => (courses || []).map((c) => c.id), [courses]);

  const progressQueries = useQueries({
    queries: courseIds.map((courseId) => ({
      queryKey: ["analytics-progress", targetSchoolId, courseId],
      queryFn: () => getSchoolCourseStudentsProgress(targetSchoolId, courseId),
      enabled: !!targetSchoolId && !!courseId,
    })),
  });

  const progressLoading = progressQueries.some((q) => q.isLoading);
  const progressError = progressQueries.some((q) => q.isError);

  const aggregatedByStudent = useMemo(() => {
    const map = new Map();
    for (const q of progressQueries) {
      const data = q.data;
      if (!data?.students) continue;
      for (const s of data.students) {
        const uid = s.user_id;
        if (!uid) continue;
        const cur = map.get(uid) ?? {
          totalCompleted: 0,
          lastCompletedAt: null,
        };
        cur.totalCompleted += s.completed_count ?? 0;
        const at = s.last_completed_at ?? null;
        if (at) {
          if (
            !cur.lastCompletedAt ||
            new Date(at) > new Date(cur.lastCompletedAt)
          ) {
            cur.lastCompletedAt = at;
          }
        }
        map.set(uid, cur);
      }
    }
    return map;
  }, [progressQueries]);

  const students = useMemo(() => {
    const allStudents = studentsData?.items || [];
    return allStudents.map((s) => {
      const agg = aggregatedByStudent.get(s.user_id);
      const totalCompleted = agg?.totalCompleted ?? 0;
      const lastLoginAt = s.last_login_at ?? null;
      const lastCompletedAt = agg?.lastCompletedAt ?? null;
      const lastActiveAt = lastLoginAt ?? lastCompletedAt;
      return {
        id: s.user_id,
        name: `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "—",
        email: s.email ?? "—",
        totalCompleted,
        lastLoginAt,
        lastCompletedAt,
        lastActive: formatRelativeTime(lastActiveAt),
      };
    });
  }, [studentsData, aggregatedByStudent]);

  const metrics = useMemo(() => {
    const totalStudents = students.length;
    const numCourses = courseIds.length;
    const active = students.filter((s) =>
      isActiveWithinPastDays(s.lastLoginAt ?? s.lastCompletedAt, 7),
    ).length;
    const engagementRate =
      totalStudents > 0 ? Math.round((active / totalStudents) * 100) : 0;
    const sumCompletions = students.reduce(
      (acc, s) => acc + (s.totalCompleted ?? 0),
      0,
    );
    const avgCompletions =
      totalStudents > 0
        ? Math.round((sumCompletions / totalStudents) * 10) / 10
        : 0;

    return {
      numCourses,
      totalStudents,
      activeStudents: active,
      engagementRate,
      avgCompletions,
    };
  }, [students, courseIds.length]);

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return students.slice(start, start + PAGE_SIZE);
  }, [students, currentPage]);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  if (coursesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <GraduationCap className="h-7 w-7 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="rounded-xl border border-red-100 bg-white py-12 text-center">
        <p className="text-red-500">Error loading courses. Please try again.</p>
      </div>
    );
  }

  if (!targetSchoolId) {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50/50 py-12 text-center">
        <p className="font-medium text-amber-800">
          Your account is not linked to a school. Connect to a school to view
          analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Teaching overview</h2>
        <p className="text-sm text-gray-500">
          School-wide analytics across all students and all courses.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600">
            <BookMarked size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {metrics.numCourses}
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            Number of courses
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="rounded-lg bg-cyan-50 p-2.5 text-cyan-600">
            <Users size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {metrics.totalStudents}
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            Total students
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="rounded-lg bg-cyan-50 p-2.5 text-cyan-600">
            <BarChart3 size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {metrics.engagementRate}%
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            Class engagement rate
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Students active in past 7 days
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
            <UserCheck size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {metrics.activeStudents}
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            Active students (this week)
          </p>
          <p className="mt-1 text-xs text-gray-400">Activity in past 7 days</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
            <BookOpen size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {metrics.avgCompletions}
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            Average completions
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Avg. lessons completed per student
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent student activity
          </h3>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {progressError && (
          <p className="mb-4 text-sm text-amber-600">
            Could not load some progress data. Showing available data.
          </p>
        )}

        {progressLoading && aggregatedByStudent.size === 0 ? (
          <div className="flex h-40 items-center justify-center py-8">
            <GraduationCap className="h-6 w-6 animate-spin text-cyan-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 pr-4 font-medium">Student</th>
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Total completions</th>
                    <th className="py-2 pr-4 font-medium">Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-500"
                      >
                        No students in this school.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="py-2 pr-4 text-gray-500">
                          {student.email}
                        </td>
                        <td className="py-2 pr-4 text-gray-600">
                          {student.totalCompleted}
                        </td>
                        <td className="py-2 pr-4 text-gray-500">
                          {student.lastActive}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {students.length > PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-full"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-xs text-gray-500">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, students.length)} of{" "}
                  {students.length}
                </span>
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherAnalytics;
