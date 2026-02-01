"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Users,
  UserCheck,
  BookOpen,
  BookMarked,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { getAllCourses } from "@/lib/cms-api";
import {
  fetchAllSchools,
  fetchAllStudents,
  getSchoolStudents,
} from "@/lib/user-api";
import {
  getCourseStudentsProgress,
  getSchoolCourseStudentsProgress,
} from "@/lib/analytics-api";
import { formatRelativeTime, isActiveWithinPastDays } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const AdminAnalytics = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [page, setPage] = useState(1);
  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["admin-analytics-courses"],
    queryFn: () => getAllCourses("admin"),
  });

  const {
    data: schoolsData,
    isLoading: schoolsLoading,
    error: schoolsError,
  } = useQuery({
    queryKey: ["admin-analytics-schools"],
    queryFn: () => fetchAllSchools(),
  });

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ["admin-analytics-students"],
    queryFn: () => fetchAllStudents(),
  });

  const courseIds = useMemo(() => (courses || []).map((c) => c.id), [courses]);

  const progressQueries = useQueries({
    queries: courseIds.map((courseId) => ({
      queryKey: ["admin-analytics-progress", courseId],
      queryFn: () => getCourseStudentsProgress(courseId),
      enabled: !!courseId,
    })),
  });

  const { data: schoolStudentsData } = useQuery({
    queryKey: ["admin-analytics-school-students", selectedSchoolId],
    queryFn: () => getSchoolStudents(selectedSchoolId),
    enabled: !!selectedSchoolId,
  });

  const schoolProgressQueries = useQueries({
    queries: courseIds.map((courseId) => ({
      queryKey: ["admin-analytics-school-progress", selectedSchoolId, courseId],
      queryFn: () =>
        getSchoolCourseStudentsProgress(selectedSchoolId, courseId),
      enabled: !!selectedSchoolId && !!courseId,
    })),
  });

  useEffect(() => {
    if (!schoolsData?.items?.length || selectedSchoolId) return;
    setSelectedSchoolId(
      schoolsData.items[0].school_id ?? schoolsData.items[0].id,
    );
  }, [schoolsData?.items, selectedSchoolId]);

  const progressLoading = progressQueries.some((q) => q.isLoading);
  const progressError = progressQueries.some((q) => q.isError);
  const schoolProgressLoading = schoolProgressQueries.some((q) => q.isLoading);
  const schoolProgressError = schoolProgressQueries.some((q) => q.isError);

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

  const metrics = useMemo(() => {
    const numCourses = courseIds.length;
    const numOrgs = schoolsData?.items?.length ?? 0;
    const totalStudents = studentsData?.items?.length ?? 0;
    const students = studentsData?.items ?? [];

    const active = students.filter((s) =>
      isActiveWithinPastDays(s.last_login_at, 7),
    ).length;

    const sumCompletions = students.reduce((acc, s) => {
      const agg = aggregatedByStudent.get(s.user_id);
      return acc + (agg?.totalCompleted ?? 0);
    }, 0);
    const avgCompletions =
      totalStudents > 0
        ? Math.round((sumCompletions / totalStudents) * 10) / 10
        : 0;

    return {
      numCourses,
      numOrgs,
      totalStudents,
      activeStudents: active,
      avgCompletions,
    };
  }, [
    courseIds.length,
    schoolsData?.items,
    studentsData?.items,
    aggregatedByStudent,
  ]);

  const schoolAggregatedByStudent = useMemo(() => {
    const map = new Map();
    for (const q of schoolProgressQueries) {
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
  }, [schoolProgressQueries]);

  const schoolStudents = useMemo(() => {
    const all = schoolStudentsData?.items ?? [];
    return all.map((s) => {
      const agg = schoolAggregatedByStudent.get(s.user_id);
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
  }, [schoolStudentsData, schoolAggregatedByStudent]);

  const totalPages = Math.max(1, Math.ceil(schoolStudents.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedSchoolStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return schoolStudents.slice(start, start + PAGE_SIZE);
  }, [schoolStudents, currentPage]);

  const handleSchoolChange = (e) => {
    setSelectedSchoolId(e.target.value || null);
    setPage(1);
  };
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  const schools = schoolsData?.items ?? [];
  const selectedSchoolName =
    schools.find((s) => (s.school_id ?? s.id) === selectedSchoolId)?.name ??
    "School";

  const loading =
    coursesLoading || schoolsLoading || studentsLoading || progressLoading;
  const error = coursesError || schoolsError || studentsError;
  const progressFailed = progressError;

  if (
    loading &&
    metrics.numCourses === 0 &&
    metrics.numOrgs === 0 &&
    metrics.totalStudents === 0
  ) {
    return (
      <div className="flex h-64 items-center justify-center">
        <GraduationCap className="h-7 w-7 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-white py-12 text-center">
        <p className="text-red-500">
          Error loading analytics. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">System overview</h2>
        <p className="text-sm text-gray-500">
          Platform-wide analytics across all organizations, courses, and
          students.
        </p>
        {progressFailed && (
          <p className="text-sm text-amber-600">
            Progress data could not be loaded. Average completions may show as
            0.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="rounded-lg bg-slate-50 p-2.5 w-[40px]  text-slate-600">
            <BookMarked size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {metrics.numCourses}
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            Total courses
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="rounded-lg bg-blue-50 p-2.5 w-[40px]  text-blue-600">
            <Building2 size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {metrics.numOrgs}
          </p>
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            Organizations
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="rounded-lg bg-cyan-50 w-[40px]  p-2.5 text-cyan-600">
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
          <div className="rounded-lg bg-emerald-50 p-2.5 w-[40px] text-emerald-600">
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
          <div className="rounded-lg bg-violet-50 p-2.5 w-[40px]  text-violet-600">
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

      {/* School selector + Recent student activities */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent student activity
          </h3>
          <div className="flex items-center gap-2">
            <label
              htmlFor="school-select"
              className="text-sm font-medium text-gray-600"
            >
              School
            </label>
            <select
              id="school-select"
              value={selectedSchoolId ?? ""}
              onChange={handleSchoolChange}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 pr-10 text-sm text-gray-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">Select a school</option>
              {schools.map((school) => {
                const id = school.school_id ?? school.id;
                return (
                  <option key={id} value={id}>
                    {school.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {!selectedSchoolId ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
            <p className="text-gray-500">
              Select a school to view recent student activity.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing students for {selectedSchoolName}
              </p>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            {schoolProgressError && (
              <p className="mb-4 text-sm text-amber-600">
                Could not load some progress data. Showing available data.
              </p>
            )}

            {schoolProgressLoading && schoolAggregatedByStudent.size === 0 ? (
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
                        <th className="py-2 pr-4 font-medium">
                          Total completions
                        </th>
                        <th className="py-2 pr-4 font-medium">Last active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSchoolStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-gray-500"
                          >
                            No students in this school.
                          </td>
                        </tr>
                      ) : (
                        paginatedSchoolStudents.map((student) => (
                          <tr
                            key={student.id}
                            className="border-b last:border-0"
                          >
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

                {schoolStudents.length > PAGE_SIZE && (
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
                      {Math.min(currentPage * PAGE_SIZE, schoolStudents.length)}{" "}
                      of {schoolStudents.length}
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
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
