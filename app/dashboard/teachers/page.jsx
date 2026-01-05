"use client";

import { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeachersTable from "@/components/dashboard/teachers/TeachersTable";
import SchoolList from "@/components/dashboard/students/SchoolList";
import { AuthContext } from "@/context/AuthContext";
import { getSchools, getSchoolTeachers, getSchoolAdmins, updateUserRole } from "@/lib/user-api";

export default function TeachersPage() {
  const { user, loading } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  // Define permissions
  const isSmriAdmin = user?.role === "smri_admin" || user?.role === "admin";
  const isSchoolAdmin = user?.role === "school_admin";

  // Calculate target view
  const targetSchoolId = isSmriAdmin ? selectedSchoolId : user?.school_id;

  const queryClient = useQueryClient();

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["school-admins"] });
    },
  });

  // Fetch schools for Admin
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ["admin-schools"],
    queryFn: () => getSchools(),
    enabled: isSmriAdmin && !selectedSchoolId, // Only fetch if admin and no school selected
  });

  // Fetch teachers for the target school (or all, for SMRI admin without school_id if backend allows)
  const {
    data: teachersData,
    isLoading: teachersLoading,
    error: teachersError,
  } = useQuery({
    queryKey: ["school-teachers", targetSchoolId],
    queryFn: () => getSchoolTeachers(targetSchoolId),
    enabled: isSchoolAdmin || (isSmriAdmin && !!targetSchoolId),
  });

  // Fetch school admins for the target school
  const {
    data: adminsData,
    isLoading: adminsLoading,
    error: adminsError,
  } = useQuery({
    queryKey: ["school-admins", targetSchoolId],
    queryFn: () => getSchoolAdmins(targetSchoolId),
    enabled: isSchoolAdmin || (isSmriAdmin && !!targetSchoolId),
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  // ---------------- ADMIN VIEW: SCHOOL LIST ---------------- //
  if (isSmriAdmin && !selectedSchoolId) {
    if (schoolsLoading) {
      return (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      );
    }

    const schools = schoolsData?.items || [];
    const filteredSchools = schools.filter((school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-8 font-sans pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Schools Listings
            </h1>
            <p className="text-gray-500 mt-1">
              Select a school to view its teachers.
            </p>
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

        {/* School List Component */}
        <SchoolList
          schools={filteredSchools}
          onSelectSchool={(school) => setSelectedSchoolId(school.school_id)}
        />
      </div>
    );
  }

  // ---------------- TEACHER LIST VIEW (School Admin OR Admin viewing School) ---------------- //
  if (isSchoolAdmin || (isSmriAdmin && selectedSchoolId)) {
    if (teachersLoading || adminsLoading) {
      return (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
        </div>
      );
    }

    if (teachersError || adminsError) {
      return (
        <div className="flex h-96 items-center justify-center text-red-500">
          <p>Unable to load teachers. Please try again.</p>
        </div>
      );
    }

    const teachersRaw = teachersData?.items || [];
    const adminsRaw = adminsData?.items || [];
    const allStaffRaw = [...adminsRaw, ...teachersRaw];

    // Deduplicate just in case, though backend should handle it. Map by ID.
    const uniqueStaff = Array.from(new Map(allStaffRaw.map(item => [item.user_id, item])).values());


    // Normalise teacher shape for the table (no hooks here to keep hook order stable)
    const teachers = uniqueStaff.map((t) => ({
      id: t.user_id,
      name: `${t.first_name} ${t.last_name || ""}`.trim(),
      email: t.email,
      role: t.role || "teacher",
      status: t.is_active ? "Active" : "Inactive",
      avatar: t.avatar_cdn_url || null,
    }));

    // Calculate stats
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter((t) => t.status === "Active").length;

    const filteredTeachers = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChangeRole = (teacher) => {
      const currentRole = (teacher.role || "").toLowerCase();
      const nextRole =
        currentRole === "school_admin" ? "teacher" : "school_admin";
      roleMutation.mutate({ userId: teacher.id, role: nextRole });
    };

    return (
      <div className="space-y-6 font-sans pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isSmriAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSchoolId(null)}
                className="mr-2"
              >
                <ArrowLeft size={24} />
              </Button>
            )}
            <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {isSchoolAdmin ? "School Teachers" : "Teacher Directory"}
            </h3>
            <p className="text-sm text-gray-600">
              Managing teachers for this school.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-xs uppercase tracking-wide text-gray-400">
                Total
              </span>
              <span className="text-base font-semibold text-gray-900">
                {totalTeachers}
              </span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex flex-col text-right">
              <span className="text-xs uppercase tracking-wide text-gray-400">
                Active
              </span>
              <span className="text-base font-semibold text-gray-900">
                {activeTeachers}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search teacher name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <TeachersTable
          teachers={filteredTeachers}
          onChangeRole={handleChangeRole}
        />
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex h-96 items-center justify-center text-gray-500">
      <p>
        Teacher management is only available for School Admins and SMRI Admins.
      </p>
    </div>
  );
}
