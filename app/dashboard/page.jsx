'use client';

import { useState, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteCourse } from '@/lib/firebase-db';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/dashboard/CourseCard';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, GraduationCap } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';

const fetchCourses = async () => {
  const res = await fetch('/api/courses');
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  return res.json();
};

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const [filter, setFilter] = useState('all');
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  // Check user role
  // Verify role from user object or email pattern for demo
  const isTeacher = user?.role === 'teacher' || user?.email?.includes('teacher');
  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');

  const filteredCourses = courses?.filter((course) => {
    if (filter === 'all') return true;
    
    // Admin specific filters
    if (isAdmin) {
        if (filter === 'draft') return course.status === 'draft';
        if (filter === 'published') return course.status === 'published';
    }

    // Student specific filters
    if (!isAdmin && !isTeacher) {
        if (filter === 'in-progress') return course.status === 'in-progress' || (course.status === 'published' && course.progress > 0 && course.progress < 100);
        if (filter === 'completed') return course.status === 'completed' || (course.status === 'published' && course.progress === 100);
    }
    
    // Fallback for generic filters
    return Boolean(course.status === filter);
  });

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await deleteCourse(courseId);
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course');
      }
    }
  };

  let tabs = [
    { id: 'all', label: 'All Courses' },
  ];

  if (isAdmin) {
    // Admin Tabs
    tabs = [
      { id: 'all', label: 'All Courses' },
      { id: 'draft', label: 'Drafts' },
      { id: 'published', label: 'Published' },
    ];
  } else if (isTeacher) {
    // Teacher Tabs
    tabs = [
      { id: 'all', label: 'All Courses' },
    ];
  } else {
    // Student Tabs (Default)
    tabs = [
      { id: 'all', label: 'All Courses' },
      { id: 'in-progress', label: 'In Progress' },
      { id: 'completed', label: 'Completed' },
    ];
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading courses. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header - matches design screenshot */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Overview</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 bg-white w-fit px-3 py-3 rounded-full border border-gray-200">
            <GraduationCap size={16} />
            <span className="font-medium">Active Courses ({filteredCourses?.length || 0})</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Tabs - Segmented Control Style */}
            <div className="inline-flex p-1 bg-gray-100 rounded-lg border border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                            filter === tab.id
                            ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Create Course Button - Only visible for admins */}
            {isAdmin && (
            <Button
                onClick={() => router.push('/dashboard/courses/create')}
                className="bg-[#3AD0E3] hover:bg-cyan-400 cursor-pointer text-black flex items-center gap-2 rounded-[100px] px-5 py-3 shadow-sm shadow-cyan-500/20"
            >
                <Plus size={18} />
                Create Course
            </Button>
            )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses?.map((course) => {
           const isStudent = !isAdmin && !isTeacher;
           return <CourseCard key={course.id} course={course} isAdmin={isAdmin} isStudent={isStudent} onDelete={handleDeleteCourse} />
        })}
      </div>

      {/* Empty State */}
      {filteredCourses?.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">
            {isAdmin 
              ? 'Get started by creating your first course' 
              : 'No courses found in this category'}
          </p>
          {isAdmin && (
            <Button
              onClick={() => router.push('/dashboard/courses/create')}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Plus size={18} className="mr-2" />
              Create Your First Course
            </Button>
          )}
        </div>
      )}
    </div>
  );
}