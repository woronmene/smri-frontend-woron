"use client";

import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeachersTable from "@/components/dashboard/teachers/TeachersTable";
import SchoolList from "@/components/dashboard/students/SchoolList";
import { AuthContext } from "@/context/AuthContext";
import { getSchools } from "@/lib/user-api";

// Mock Teachers Data (since endpoint is not ready)
const MOCK_TEACHERS = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "teacher", status: "Active" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "teacher", status: "Active" },
  { id: 3, name: "Charlie Davis", email: "charlie@example.com", role: "teacher", status: "Inactive" },
  { id: 4, name: "Diana Evans", email: "diana@example.com", role: "teacher", status: "Active" },
  { id: 5, name: "Evan Wright", email: "evan@example.com", role: "teacher", status: "Active" },
  { id: 6, name: "Fiona White", email: "fiona@example.com", role: "teacher", status: "Active" },
];

export default function TeachersPage() {
  const { user, loading } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  // Define permissions
  const isSmriAdmin = user?.role === "smri_admin" || user?.role === "admin";
  const isSchoolAdmin = user?.role === "school_admin";
  
  // Calculate target view
  const targetSchoolId = isSmriAdmin ? selectedSchoolId : user?.school_id;

  // Fetch schools for Admin
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ["admin-schools"],
    queryFn: () => getSchools(),
    enabled: isSmriAdmin && !selectedSchoolId, // Only fetch if admin and no school selected
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
    // In future, useQuery(..., getSchoolTeachers(targetSchoolId)) here.
    const teachers = MOCK_TEACHERS; 
    
    // Calculate stats
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === 'Active').length;

    const filteredTeachers = teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleMakeAdmin = (teacherId) => {
        // Placeholder for future API call
        alert(`Request to make Teacher ID: ${teacherId} a School Admin`);
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
            <h1 className="text-3xl font-bold text-gray-900">
              Teachers
            </h1>
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
        <TeachersTable teachers={filteredTeachers} onMakeAdmin={handleMakeAdmin} />
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex h-96 items-center justify-center text-gray-500">
      <p>Teacher management is only available for School Admins and SMRI Admins.</p>
    </div>
  );
}
