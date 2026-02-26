"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StudentsTable from "@/components/dashboard/students/StudentsTable";
import SchoolList from "@/components/dashboard/students/SchoolList";
import { AuthContext } from "@/context/AuthContext";
import { getAllCourses, getCourseById } from "@/lib/cms-api";
import {
  getSchools,
  getSchoolStudents,
  fetchAllStudents,
} from "@/lib/user-api";
import {
  getCourseStudentsProgress,
  getSchoolCourseStudentsProgress,
} from "@/lib/analytics-api";

export default function StudentsPage() {
  const { user, loading } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  // Determine effective roles
  const isSmriAdmin = user?.role === "smri_admin";
  // School Admin is treated as "Teacher" level for this view (sees only their school)
  const isSchoolAdmin = user?.role === "school_admin";
  // If user is a teacher OR school_admin OR has teacher in email
  const isTeacher =
    user?.role === "teacher" ||
    isSchoolAdmin ||
    user?.email?.toLowerCase().includes("teacher");

  // "isAdmin" in this context controls the Schools List view (SMRI Admin only)
  // We exclude School Admin from this to force them into the single-school view
  const isAdmin =
    isSmriAdmin ||
    user?.role === "admin" ||
    user?.email?.toLowerCase().includes("admin");

  // Role used when calling CMS API for courses
  const userRole = isAdmin ? "admin" : "teacher";

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Fetch courses from CMS
  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["students-courses", userRole],
    queryFn: () => getAllCourses(userRole),
    enabled: isTeacher || isAdmin,
  });

  useEffect(() => {
    if (!courses || courses.length === 0) return;
    if (!selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses?.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId],
  );

  // Detailed course
  const {
    data: courseDetail,
    isLoading: courseDetailLoading,
    error: courseDetailError,
  } = useQuery({
    queryKey: ["students-course-detail", selectedCourseId],
    queryFn: () => getCourseById(selectedCourseId),
    enabled: !!selectedCourseId && (isTeacher || isAdmin),
  });

  // Calculate target school ID
  const targetSchoolId = isAdmin ? selectedSchoolId : user?.school_id;

  // Fetch schools for Admin
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ["admin-schools"],
    queryFn: () => getSchools(),
    enabled: isAdmin && !selectedSchoolId, // Only fetch list if not viewing a specific school
  });

  // Fetch all students for SMRI admin to compute accurate per-school counts
  const { data: allStudentsData, isLoading: allStudentsLoading } = useQuery({
    queryKey: ["admin-students-all"],
    queryFn: () => fetchAllStudents(),
    enabled: isAdmin && !selectedSchoolId,
  });

  // Fetch authoritative list of students for the target school
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["school-students", targetSchoolId],
    queryFn: () => getSchoolStudents(targetSchoolId),
    enabled: !!targetSchoolId && (isTeacher || isAdmin),
  });

  // Fetch analytics progress
  const {
    data: analyticsProgress,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["students-analytics", selectedCourseId, targetSchoolId],
    queryFn: () =>
      targetSchoolId
        ? getSchoolCourseStudentsProgress(targetSchoolId, selectedCourse.id)
        : getCourseStudentsProgress(selectedCourseId),
    enabled: !!selectedCourseId && !!targetSchoolId && (isTeacher || isAdmin),
  });

  const currentSchoolName = useMemo(() => {
    if (isAdmin && selectedSchoolId && schoolsData?.items) {
      return schoolsData.items.find((s) => s.school_id === selectedSchoolId)
        ?.name;
    }
    return user?.school_name || "School Students";
  }, [isAdmin, selectedSchoolId, schoolsData, user]);

  // Calculate derived student data at top level to ensure hooks stability
  // and availability for export
  const filteredStudents = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    // Determine effective course/modules/lessons
    const effectiveCourse = courseDetail || selectedCourse;
    if (!effectiveCourse) return [];

    const moduleCount = effectiveCourse?.modules?.length || 0;
    const lessonCount =
      effectiveCourse?.modules?.reduce(
        (sum, m) => sum + (m.lessons?.length || 0),
        0,
      ) || 0;

    // Merge student list with analytics
    const allStudents = studentsData?.items || [];
    const analyticsMap = new Map(
      (analyticsProgress?.students || []).map((s) => [s.user_id, s]),
    );

    const studentsForCourse = allStudents.map((s) => {
      const progressRecord = analyticsMap.get(s.user_id);

      const totalLessons = lessonCount || 0;
      const completedCount = progressRecord?.completed_count || 0;

      const rawProgress =
        totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

      const completed = totalLessons > 0 && completedCount >= totalLessons;

      return {
        id: s.user_id,
        name: `${s.first_name} ${s.last_name || ""}`.trim(),
        firstName: s.first_name,
        lastName: s.last_name || "",
        email: s.email,
        course: selectedCourse?.title || effectiveCourse?.title || "Course",
        progress: rawProgress,
        lastActive: progressRecord?.last_completed_at
          ? new Date(progressRecord.last_completed_at).toLocaleString()
          : "Not started",
        status: completed
          ? "Completed"
          : progressRecord
            ? "In progress"
            : "Not started",
        moduleCount, // Passing these through if needed for display later, though currently redundant in the table object
        lessonCount,
      };
    });

    return studentsForCourse.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.course.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [
    courses,
    courseDetail,
    selectedCourse,
    studentsData,
    analyticsProgress,
    searchQuery,
  ]);

  const handleExport = () => {
    if (!filteredStudents || filteredStudents.length === 0) return;

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Course",
      "Progress",
      "Last Active",
      "Status",
    ];
    const csvContent =
      "\uFEFF" +
      [
        headers.join(","),
        ...filteredStudents.map((student) =>
          [
            `"${student.firstName}"`,
            `"${student.lastName}"`,
            `"${student.email}"`,
            `"${student.course}"`,
            `${student.progress}%`,
            `"${student.lastActive}"`,
            `"${student.status}"`,
          ].join(","),
        ),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `students_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  // --------------- ADMIN VIEW: SCHOOL LIST ---------------- //
  if (isAdmin && !selectedSchoolId) {
    if (schoolsLoading || allStudentsLoading) {
      return (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      );
    }

    const schools = schoolsData?.items || [];
    const allStudents = allStudentsData?.items || [];

    const studentCountsBySchool = new Map();
    allStudents.forEach((student) => {
      const sid = student.school_id;
      if (!sid) return;
      studentCountsBySchool.set(sid, (studentCountsBySchool.get(sid) || 0) + 1);
    });

    const schoolsWithCounts = schools.map((school) => ({
      ...school,
      studentCount: studentCountsBySchool.get(school.school_id) ?? 0,
    }));

    const filteredSchools = schoolsWithCounts.filter((school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <div className="space-y-8 font-sans pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Listings
            </h1>
            <p className="text-gray-500 mt-1">Select a school to view its</p>
          </div>
        </div>

        {/* Search Bar for Schools */}
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 text-sm"
          />
        </div>

        {/* Pass onSelect param to SchoolList (assuming it supports it or we wrap it) */}
        {/* Note: SchoolList currently might expect 'mock' data or handle selection internally. 
            I'll wrap it to handle selection from the parent. 
            Actually, looking at previous context, SchoolList might need update if it doesn't support onSelect.
            For now, I'll pass the schools and assume I can add an onClick handler to items or SchoolList prop. 
            If SchoolList doesn't support prop, I might need to update it. 
            Let's assume SchoolList renders cards. I'll modify SchoolList next if needed.
            For now, passing onSelectSchool (if SchoolList supports it) or just rendering a grid here if simpler.
            Wait, I should check SchoolList implementation in next step if it fails.
            But to be safe, I can just map here if I'm not sure. 
            However, user wants "SchoolList" component used.
            I will pass onSelectSchool={setSelectedSchoolId} and ensure SchoolList uses it.
        */}
        <SchoolList
          schools={filteredSchools}
          onSelectSchool={(school) => setSelectedSchoolId(school.school_id)}
        />
      </div>
    );
  }

  // --------------- STUDENT VIEW (Teacher OR Admin viewing School) ---------------- //
  if (isTeacher || (isAdmin && selectedSchoolId)) {
    if (coursesLoading || studentsLoading) {
      return (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      );
    }

    if (coursesError) {
      return (
        <div className="flex h-96 items-center justify-center text-red-500">
          <p>Unable to load courses. Please try again.</p>
        </div>
      );
    }

    if (!courses || courses.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center text-gray-500">
          <p>No courses found. Create a course to view student progress.</p>
        </div>
      );
    }

    const effectiveCourse = courseDetail || selectedCourse;
    const moduleCount = effectiveCourse?.modules?.length || 0;
    const lessonCount =
      effectiveCourse?.modules?.reduce(
        (sum, m) => sum + (m.lessons?.length || 0),
        0,
      ) || 0;

    return (
      <div className="space-y-6 font-sans pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSchoolId(null)}
                className="mr-2"
              >
                <ArrowLeft size={24} />
              </Button>
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? "School Students" : "Students"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* <Button
              variant="outline"
              className="bg-white hover:bg-gray-50 text-gray-900 border-gray-200 rounded-[100px] px-5 py-3 shadow-sm h-auto font-medium"
            >
              {currentSchoolName}
              <ChevronDown size={16} className="ml-2 text-gray-400" />
            </Button> */}
            <Button
              onClick={handleExport}
              className="bg-[#3AD0E3] hover:bg-cyan-400 cursor-pointer text-black flex items-center gap-2 rounded-[100px] px-5 py-3 shadow-sm shadow-cyan-500/20 border-none h-auto font-medium"
            >
              <Download size={18} />
              Export Student Data
            </Button>
          </div>
        </div>

        {/* Course selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative inline-block w-full sm:w-72">
            <select
              value={selectedCourseId || ""}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="appearance-none w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-900 font-medium py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors shadow-sm cursor-pointer text-sm"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Selected course details */}
        {/* Selected course details */}
        {effectiveCourse && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-2 flex-2 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {effectiveCourse.title}
              </h3>
              <div className="text-sm text-gray-600">
                <p
                  className={`${!showFullDescription ? "line-clamp-1" : ""} break-words`}
                >
                  {effectiveCourse.fullDescription ||
                    effectiveCourse.description ||
                    "No description provided yet."}
                </p>
                {(
                  effectiveCourse.fullDescription || effectiveCourse.description
                )?.length > 100 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-[#3AD0E3] hover:text-cyan-600 font-medium text-xs mt-1 focus:outline-none"
                  >
                    {showFullDescription ? "Less" : "More"}
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-1 justify-center items-center gap-6 flex-shrink-0 pt-1">
              <div className="flex flex-col text-right">
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  Modules
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {moduleCount}
                </span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col text-right">
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  Lessons
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {lessonCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search student name or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 text-sm"
            />
          </div>

          {/* <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-[100px] text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm shadow-sm">
            <Filter size={18} />
            Filter Students
          </button> */}
        </div>

        {/* Table */}
        <StudentsTable students={filteredStudents} />
      </div>
    );
  }

  // --------------- DEFAULT: NON-STAFF USERS ---------------- //
  return (
    <div className="flex h-96 items-center justify-center text-gray-500">
      <p>Student management is only available for teachers and admin.</p>
    </div>
  );
}
