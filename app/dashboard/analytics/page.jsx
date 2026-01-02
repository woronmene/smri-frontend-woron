'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import AdminAnalytics from '@/components/dashboard/analytics/AdminAnalytics';
import TeacherAnalytics from '@/components/dashboard/analytics/TeacherAnalytics';

export default function AnalyticsPage() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  // Determine role
  // Determine role
  const isTeacher = user?.role === 'teacher' || user?.role === "school_admin" || user?.role === "smri_admin" || user?.email?.includes('teacher');
  const isAdmin = user?.role === 'admin' || user?.role === "smri_admin" || user?.email?.includes('admin');

  // If student (or neither), maybe redirect or show simplified view. 
  // Requirement says "show up for just teachers and admin".
  if (!isTeacher && !isAdmin) {
      return (
          <div className="flex h-96 items-center justify-center text-gray-500">
             <p>Analytics are only available for administrative staff.</p>
          </div>
      );
  }

  return (
    <>
      {isAdmin ? <AdminAnalytics /> : <TeacherAnalytics />}
    </>
  );
}
