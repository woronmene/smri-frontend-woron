"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Users,
  UserCheck,
  BookOpen,
  BookMarked,
  Building2,
} from "lucide-react";

import { getAllCourses } from "@/lib/cms-api";
import { fetchAllSchools, fetchAllStudents } from "@/lib/user-api";
import { getCourseStudentsProgress } from "@/lib/analytics-api";
import { isActiveWithinPastDays } from "@/lib/utils";

const AdminAnalytics = () => {
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
          <div className="rounded-lg bg-slate-50 p-2.5 text-slate-600">
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
          <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
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
    </div>
  );
};

export default AdminAnalytics;
