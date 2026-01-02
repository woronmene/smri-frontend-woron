"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudentsTable from "@/components/dashboard/students/StudentsTable";
import SchoolsDrawer from "@/components/dashboard/students/SchoolsDrawer";
import { getAllCourses, getCourseById } from "@/lib/cms-api";
import { getSchoolCourseStudentsProgress } from "@/lib/analytics-api";

// Mock Data (Replicated for demo)
const MOCK_SCHOOLS = [
  {
    id: "SCH001",
    name: "Greenfield High School",
    location: "New York, NY",
    studentCount: 145,
  },
  {
    id: "SCH002",
    name: "River Valley Academy",
    location: "Austin, TX",
    studentCount: 89,
  },
  {
    id: "SCH003",
    name: "Tech Future Institute",
    location: "San Francisco, CA",
    studentCount: 210,
  },
  {
    id: "SCH004",
    name: "Oakwood Secondary",
    location: "Chicago, IL",
    studentCount: 167,
  },
];

export default function SchoolStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.schoolId;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const currentSchool =
    MOCK_SCHOOLS.find((s) => s.id === schoolId) || MOCK_SCHOOLS[0];

  const handleSchoolSelect = (school) => {
    setIsDrawerOpen(false);
    router.push(`/dashboard/students/${school.id}`);
  };

  // Fetch all courses (for now we don't filter by school; that can be added later)
  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["admin-school-courses"],
    queryFn: () => getAllCourses("admin"),
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

  // Detailed course with modules/lessons
  const {
    data: courseDetail,
    isLoading: courseDetailLoading,
    error: courseDetailError,
  } = useQuery({
    queryKey: ["admin-school-course-detail", selectedCourseId],
    queryFn: () => getCourseById(selectedCourseId),
    enabled: !!selectedCourseId,
  });

  // Analytics for this school + course
  const {
    data: analyticsProgress,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["admin-school-analytics", schoolId, selectedCourseId],
    queryFn: () => getSchoolCourseStudentsProgress(schoolId, selectedCourseId),
    enabled: !!schoolId && !!selectedCourseId,
  });

  useEffect(() => {
    if (analyticsProgress) {
      console.log(
        "Admin school analytics for course:",
        schoolId,
        selectedCourseId,
        analyticsProgress
      );
    }
  }, [analyticsProgress, schoolId, selectedCourseId]);

  if (coursesLoading || courseDetailLoading || analyticsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-gray-500 text-sm">Loading school students…</span>
      </div>
    );
  }

  if (coursesError || courseDetailError || analyticsError) {
    return (
      <div className="flex h-96 items-center justify-center text-red-500 text-sm">
        Unable to load school students view. Please try again.
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-500 text-sm">
        No courses found. Create a course to see student progress.
      </div>
    );
  }

  const effectiveCourse = courseDetail || selectedCourse;
  const moduleCount = effectiveCourse?.modules?.length || 0;
  const lessonCount =
    effectiveCourse?.modules?.reduce(
      (sum, m) => sum + (m.lessons?.length || 0),
      0
    ) || 0;

  const analyticsStudents = analyticsProgress?.students || [];
  const studentsForCourse = analyticsStudents.map((s) => {
    const totalLessons = lessonCount || 0;
    const rawProgress =
      totalLessons > 0
        ? Math.round((s.completed_count / totalLessons) * 100)
        : 0;

    return {
      id: s.user_id,
      name: s.user_id,
      course: selectedCourse?.title || effectiveCourse?.title || "Course",
      progress: rawProgress,
      lastActive: s.last_completed_at
        ? new Date(s.last_completed_at).toLocaleString()
        : "—",
      status:
        totalLessons > 0 && s.completed_count >= totalLessons
          ? "Completed"
          : "In progress",
      avatar: null,
    };
  });

  const filteredStudents = studentsForCourse.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    const headers = ["Name", "Progress", "Last Active"];
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map(
        (s) => `"${s.name}",${s.progress},"${s.lastActive}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentSchool.name.replace(/\s+/g, "_")}_students.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header with School Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-white hover:bg-gray-50 text-gray-900 cursor-pointer border-gray-200 rounded-[100px] px-5 py-3 shadow-sm h-auto font-medium"
          >
            {currentSchool.name}
          </button>
        </div>
        <Button
          variant="outline"
          className="bg-[#3AD0E3] hover:bg-cyan-400 cursor-pointer text-black flex items-center gap-2 rounded-[100px] px-5 py-3 shadow-sm shadow-cyan-500/20 border-none h-auto font-medium"
          onClick={handleExport}
        >
          <Download size={18} className="mr-2" />
          Export Student Data
        </Button>
      </div>

      {/* Course selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="inline-flex w-full sm:w-auto p-1 bg-gray-100 rounded-lg border border-gray-200 overflow-x-auto max-w-full">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
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

      {/* Selected course details */}
      {effectiveCourse && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {effectiveCourse.title}
            </h3>
            <p className="text-sm text-gray-600">
              {effectiveCourse.fullDescription ||
                effectiveCourse.description ||
                "No description provided yet."}
            </p>
          </div>
          <div className="flex items-center gap-4">
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

        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-[100px] text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm shadow-sm">
          <Filter size={18} />
          Filter Students
        </button>
      </div>

      {/* Table */}
      <StudentsTable students={filteredStudents} />

      {/* Schools Drawer */}
      <SchoolsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        schools={MOCK_SCHOOLS}
        currentSchool={currentSchool}
        onSelectSchool={handleSchoolSelect}
      />
    </div>
  );
}

